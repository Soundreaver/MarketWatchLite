import { Cryptocurrency, SearchResult, ChartData, CryptoDetails, OHLCData } from "./types";

const BINANCE_API_URL = "https://api.binance.com/api/v3";

// Simple in-memory cache for the massive Binance ticker payload
let cryptoListCache: Cryptocurrency[] = [];
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60000; // 60 seconds

export async function fetchCryptoList(
  ids?: string[]
): Promise<Cryptocurrency[]> {
  const now = Date.now();
  
  // Return cached list if valid to save bandwidth (Binance returns ALL pairs at once)
  if (cryptoListCache.length > 0 && now - cacheTimestamp < CACHE_TTL_MS) {
    if (ids && ids.length > 0) {
      return cryptoListCache.filter((c) => ids.includes(c.id));
    }
    return cryptoListCache.slice(0, 100); // Return top 100 by default
  }

  const response = await fetch(`${BINANCE_API_URL}/ticker/24hr`);
  if (!response.ok) {
    throw new Error("Failed to fetch cryptocurrency data from Binance");
  }
  
  const data: any[] = await response.json();

  // Filter for only USDT pairs and map to our format
  const usdtPairs = data
    .filter((ticker) => ticker.symbol.endsWith("USDT"))
    .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));

  const mappedData: Cryptocurrency[] = usdtPairs.map((ticker, index) => {
    const symbol = ticker.symbol.replace("USDT", "");
    return {
      id: ticker.symbol, // using the full trading pair as ID (e.g. BTCUSDT)
      symbol: symbol.toLowerCase(),
      name: symbol, // Binance doesn't provide names, use symbol
      image: `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/${symbol.toLowerCase()}.png`, // Fallback CDN
      current_price: parseFloat(ticker.lastPrice),
      market_cap: parseFloat(ticker.quoteVolume), // Using 24h volume as a stand-in for market cap sorting rank
      market_cap_rank: index + 1,
      fully_diluted_valuation: null,
      total_volume: parseFloat(ticker.volume),
      high_24h: parseFloat(ticker.highPrice),
      low_24h: parseFloat(ticker.lowPrice),
      price_change_24h: parseFloat(ticker.priceChange),
      price_change_percentage_24h: parseFloat(ticker.priceChangePercent),
      market_cap_change_24h: 0,
      market_cap_change_percentage_24h: 0,
      circulating_supply: 0,
      total_supply: null,
      max_supply: null,
      ath: 0,
      ath_change_percentage: 0,
      ath_date: "",
      atl: 0,
      atl_change_percentage: 0,
      atl_date: "",
      roi: null,
      last_updated: new Date(ticker.closeTime).toISOString(),
    };
  });

  cryptoListCache = mappedData;
  cacheTimestamp = now;

  if (ids && ids.length > 0) {
    return cryptoListCache.filter((c) => ids.includes(c.id));
  }
  return cryptoListCache.slice(0, 50); // Return top 50
}

export async function searchCrypto(query: string): Promise<SearchResult[]> {
  const list = await fetchCryptoList();
  const q = query.toLowerCase();
  
  const results = list
    .filter((c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q))
    .slice(0, 10)
    .map((c) => ({
      id: c.id,
      name: c.name,
      symbol: c.symbol,
      market_cap_rank: c.market_cap_rank,
      thumb: c.image,
      large: c.image,
    }));

  return results;
}

export async function fetchCryptoDetails(id: string): Promise<CryptoDetails> {
  // Binance doesn't have a single "details" endpoint with rich metadata.
  // We'll reuse the 24hr ticker data to fill the base CryptoDetails interface.
  const response = await fetch(`${BINANCE_API_URL}/ticker/24hr?symbol=${id.toUpperCase()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch cryptocurrency details from Binance");
  }
  
  const ticker = await response.json();
  const symbol = ticker.symbol.replace("USDT", "").toLowerCase();

  return {
    id: ticker.symbol,
    symbol: symbol,
    name: symbol.toUpperCase(),
    image: `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/${symbol}.png`,
    current_price: parseFloat(ticker.lastPrice),
    market_cap: parseFloat(ticker.quoteVolume),
    market_cap_rank: 0,
    fully_diluted_valuation: null,
    total_volume: parseFloat(ticker.volume),
    high_24h: parseFloat(ticker.highPrice),
    low_24h: parseFloat(ticker.lowPrice),
    price_change_24h: parseFloat(ticker.priceChange),
    price_change_percentage_24h: parseFloat(ticker.priceChangePercent),
    market_cap_change_24h: 0,
    market_cap_change_percentage_24h: 0,
    circulating_supply: 0,
    total_supply: null,
    max_supply: null,
    ath: 0,
    ath_change_percentage: 0,
    ath_date: "",
    atl: 0,
    atl_change_percentage: 0,
    atl_date: "",
    roi: null,
    last_updated: new Date(ticker.closeTime).toISOString(),
    description: undefined, // Unavailable on Binance API
    links: undefined,       // Unavailable on Binance API
  };
}

export async function fetchChartData(
  id: string,
  days: number
): Promise<ChartData> {
  // This might break the old sparklines if any are still using it, but we replaced them with simple OHLC sparklines or pure CSS in CryptoCard!
  // If we still need simple sparklines, we'd build them from klines.
  const ohlc = await fetchOHLCData(id, days);
  
  // Mock conversion for legacy chart components (not needed for lightweight-charts)
  const prices: [number, number][] = ohlc.map(p => [p[0], p[4]]); 
  return {
    prices: prices,
    market_caps: prices, // mocked
    total_volumes: prices, // mocked
  };
}

export async function fetchOHLCData(
  id: string,
  days: number
): Promise<OHLCData> {
  let interval = "1h"; // default for 1 day
  if (days <= 1) interval = "1h";
  else if (days <= 7) interval = "4h";
  else if (days <= 30) interval = "1d";
  else if (days <= 365) interval = "1w";
  else interval = "1M";

  // Limit to roughly 500 candles max
  const response = await fetch(
    `${BINANCE_API_URL}/klines?symbol=${id.toUpperCase()}&interval=${interval}&limit=500`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch OHLC data from Binance");
  }
  
  const data: any[][] = await response.json();
  
  // Binance klines format: [ Open time, Open, High, Low, Close, Volume, Close time, ... ]
  return data.map((d) => [
    d[0],            // time (ms)
    parseFloat(d[1]), // open
    parseFloat(d[2]), // high
    parseFloat(d[3]), // low
    parseFloat(d[4])  // close
  ]);
}
