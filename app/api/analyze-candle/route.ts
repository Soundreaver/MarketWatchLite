import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { cryptoId, cryptoName, candle, apiKey } = await req.json();

    const finalApiKey = apiKey || process.env.GEMINI_API_KEY;

    if (!finalApiKey) {
      return NextResponse.json(
        { error: 'No Google Gemini API key provided. Please set it in the top navigation bar.' },
        { status: 401 }
      );
    }

    // Initialize Gemini API per-request with the user's key (or fallback `.env` key)
    const genAI = new GoogleGenerativeAI(finalApiKey);

    const { time, open, high, low, close } = candle;
    const date = new Date(time * 1000).toDateString();

    // 1. Fetch free latest news from CryptoCompare to give AI some context
    let newsContext = '';
    try {
      const newsRes = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
      if (newsRes.ok) {
        const newsData = await newsRes.json();
        const topNews = newsData.Data.slice(0, 5).map((n: any) => n.title).join('\n- ');
        newsContext = `- ${topNews}`;
      }
    } catch (e) {
      console.error('Error fetching news:', e);
      // It's okay if news fails, we still rely on Gemini's internal knowledge
    }

    // 2. Build the prompt for Gemini
    const isBullish = close >= open;
    const direction = isBullish ? 'bullish' : 'bearish';
    
    const prompt = `
You are an expert cryptocurrency market analyst. I am looking at a specific candlestick on the chart for ${cryptoName} (${cryptoId.toUpperCase()}).

Date: ${date}
Open: $${open}
High: $${high}
Low: $${low}
Close: $${close}

The price action for this period was ${direction}.
${newsContext ? `\nSome recent crypto news headlines for context:\n${newsContext}\n` : ''}

Please analyze this price action. What might have caused these movements? If this is a historical date, use your knowledge of crypto market events around ${date} for ${cryptoName}. If it's recent, consider the news provided or general recent trends. 

Provide a concise, professional 1 paragraph analysis. Do not include markdown formatting like headers, just a single plain text paragraph.
    `.trim();

    // 3. Call Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ analysis: text });

  } catch (error: any) {
    console.error('Error in analyze-candle:', error);
    
    // Check for 429 from Google
    if (error.status === 429 || (error.message && error.message.includes('429'))) {
       return NextResponse.json(
        { error: 'You have exceeded your Gemini API quota rate limits. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to analyze market data. Please verify your Gemini API key and try again.' },
      { status: 500 }
    );
  }
}

