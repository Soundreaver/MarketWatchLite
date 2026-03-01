import { useQuery, useQueries } from "@tanstack/react-query";
import {
  fetchCryptoList,
  searchCrypto,
  fetchCryptoDetails,
  fetchChartData,
  fetchOHLCData,
} from "@/lib/api";
import {
  Cryptocurrency,
  SearchResult,
  CryptoDetails,
  ChartData,
} from "@/lib/types";

export function useCryptoList(ids?: string[]) {
  return useQuery<Cryptocurrency[]>({
    queryKey: ["cryptoList", ids],
    queryFn: () => fetchCryptoList(ids),
    staleTime: 60000, // Consider data stale after 60 seconds
    refetchOnWindowFocus: false, // Prevent excessive refetches
  });
}

export function useCryptoSearch(query: string) {
  return useQuery<SearchResult[]>({
    queryKey: ["cryptoSearch", query],
    queryFn: () => searchCrypto(query),
    enabled: query.length > 0,
    staleTime: 60000, // Search results can be cached for 1 minute
  });
}

export function useCryptoDetails(id: string) {
  return useQuery<CryptoDetails>({
    queryKey: ["cryptoDetails", id],
    queryFn: () => fetchCryptoDetails(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes (prevent excessive fetching)
    refetchOnWindowFocus: false,
  });
}

export function useChartData(id: string, days: number) {
  return useQuery<ChartData>({
    queryKey: ["chartData", id, days],
    queryFn: () => fetchChartData(id, days),
    enabled: !!id,
    staleTime: 60000, // Chart data can be cached for 1 minute
  });
}

export function useMultipleCryptoDetails(ids: string[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ["cryptoDetails", id],
      queryFn: () => fetchCryptoDetails(id),
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    })),
  });
}

export function useOHLCData(id: string, days: number) {
  return useQuery({
    queryKey: ["ohlcData", id, days],
    queryFn: () => fetchOHLCData(id, days),
    enabled: !!id,
    staleTime: 60000, // OHLC data can be cached for 1 minute
  });
}
