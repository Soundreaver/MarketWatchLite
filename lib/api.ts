import { Cryptocurrency, SearchResult, ChartData, CryptoDetails } from "./types";

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

export async function fetchCryptoList(
  ids?: string[]
): Promise<Cryptocurrency[]> {
  const params = new URLSearchParams({
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: ids ? ids.length.toString() : "20",
    page: "1",
    sparkline: "true",
    price_change_percentage: "24h,7d",
  });

  if (ids && ids.length > 0) {
    params.append("ids", ids.join(","));
  }

  const response = await fetch(`${COINGECKO_API_URL}/coins/markets?${params}`);
  if (!response.ok) {
    throw new Error("Failed to fetch cryptocurrency data");
  }
  return response.json();
}

export async function searchCrypto(query: string): Promise<SearchResult[]> {
  const response = await fetch(
    `${COINGECKO_API_URL}/search?query=${encodeURIComponent(query)}`
  );
  if (!response.ok) {
    throw new Error("Failed to search cryptocurrencies");
  }
  const data = await response.json();
  return data.coins || [];
}

export async function fetchCryptoDetails(id: string): Promise<CryptoDetails> {
  const response = await fetch(
    `${COINGECKO_API_URL}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch cryptocurrency details");
  }
  const data = await response.json();

  // Transform the data to match our Cryptocurrency interface
  return {
    id: data.id,
    symbol: data.symbol,
    name: data.name,
    image: data.image.large,
    current_price: data.market_data.current_price.usd,
    market_cap: data.market_data.market_cap.usd,
    market_cap_rank: data.market_cap_rank,
    fully_diluted_valuation:
      data.market_data.fully_diluted_valuation?.usd || null,
    total_volume: data.market_data.total_volume.usd,
    high_24h: data.market_data.high_24h.usd,
    low_24h: data.market_data.low_24h.usd,
    price_change_24h: data.market_data.price_change_24h,
    price_change_percentage_24h: data.market_data.price_change_percentage_24h,
    market_cap_change_24h: data.market_data.market_cap_change_24h,
    market_cap_change_percentage_24h:
      data.market_data.market_cap_change_percentage_24h,
    circulating_supply: data.market_data.circulating_supply,
    total_supply: data.market_data.total_supply,
    max_supply: data.market_data.max_supply,
    ath: data.market_data.ath.usd,
    ath_change_percentage: data.market_data.ath_change_percentage.usd,
    ath_date: data.market_data.ath_date.usd,
    atl: data.market_data.atl.usd,
    atl_change_percentage: data.market_data.atl_change_percentage.usd,
    atl_date: data.market_data.atl_date.usd,
    roi: null,
    last_updated: data.last_updated,
    sparkline_in_7d: data.market_data.sparkline_7d,
    description: data.description,
    links: data.links,
  };
}

export async function fetchChartData(
  id: string,
  days: number
): Promise<ChartData> {
  const response = await fetch(
    `${COINGECKO_API_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch chart data");
  }
  return response.json();
}
