"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, MouseEventParams, CandlestickSeries, Time } from "lightweight-charts";
import { OHLCData } from "@/lib/types";

export interface CandlestickDataPoint {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandlestickChartProps {
  data: OHLCData;
  onCandleClick?: (candle: CandlestickDataPoint) => void;
}

export function CandlestickChart({ data, onCandleClick }: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    // Transform CoinGecko data (ms timestamps) to lightweight-charts format (seconds)
    const formattedData: CandlestickDataPoint[] = data.map(
      ([timestamp, open, high, low, close]) => ({
        time: (Math.floor(timestamp / 1000) as unknown) as Time,
        open,
        high,
        low,
        close,
      })
    );

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(255, 255, 255, 0.5)",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.1)" },
        horzLines: { color: "rgba(255, 255, 255, 0.1)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 256, // matching h-64
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1, // Normal crosshair
      }
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    candlestickSeries.setData(formattedData);

    window.addEventListener("resize", handleResize);

    // Click handler
    chart.subscribeClick((param: MouseEventParams) => {
      if (!param.point || !param.time || !onCandleClick) {
        return;
      }
      
      const priceData = param.seriesData.get(candlestickSeries) as CandlestickDataPoint | undefined;
      if (priceData) {
        onCandleClick(priceData);
      }
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, onCandleClick]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
}
