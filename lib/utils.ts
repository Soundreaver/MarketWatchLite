import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  }
  if (value < 0.01) {
    return `$${value.toFixed(6)}`;
  }
  return `$${value.toFixed(2)}`;
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function encodeWatchlist(watchlist: string[]): string {
  return btoa(JSON.stringify(watchlist));
}

export function decodeWatchlist(encoded: string): string[] {
  try {
    return JSON.parse(atob(encoded));
  } catch {
    return [];
  }
}
