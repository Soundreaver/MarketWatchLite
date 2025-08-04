import { useQuery, useQueries } from "@tanstack/react-query";
import {
  fetchCryptoList,
  searchCrypto,
  fetchCryptoDetails,
  fetchChartData,
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
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
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
    staleTime: 30000,
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
      staleTime: 30000,
    })),
  });
}
