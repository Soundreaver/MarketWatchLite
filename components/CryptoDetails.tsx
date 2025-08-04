"use client"

import { useState } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatPercentage, formatNumber } from '@/lib/utils'
import { useCryptoDetails, useChartData } from '@/hooks/useCrypto'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  TimeScale,
} from 'chart.js'
import 'chartjs-adapter-date-fns'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
)

interface CryptoDetailsProps {
  cryptoId: string
  onClose: () => void
}

const timeframes = [
  { label: '1H', days: 0.04 },
  { label: '24H', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '1Y', days: 365 },
]

export function CryptoDetails({ cryptoId, onClose }: CryptoDetailsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState(1)
  const { data: crypto, isLoading: cryptoLoading, isError: cryptoError } = useCryptoDetails(cryptoId)
  const { data: chartData, isLoading: chartLoading, isError: chartError } = useChartData(cryptoId, selectedTimeframe)

  // Use a key to force re-mount when the cryptoId changes
  // This ensures the skeleton is shown while the new data is loading
  if (cryptoLoading || !crypto) {
    return <CryptoDetailsSkeleton key={cryptoId} />
  }

  const isPositive = crypto.price_change_percentage_24h >= 0

  const chartConfig = {
    labels: chartData?.prices.map(([timestamp]) => new Date(timestamp)),
    datasets: [
      {
        label: 'Price',
        data: chartData?.prices.map(([_, price]) => price),
        borderColor: isPositive ? '#10b981' : '#ef4444',
        backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  }

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#333',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context) => {
            return `$${context.parsed.y.toFixed(2)}`
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: selectedTimeframe <= 1 ? 'hour' : selectedTimeframe <= 30 ? 'day' : 'month',
        },
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          callback: (value) => `$${Number(value).toLocaleString()}`,
          color: 'rgba(255, 255, 255, 0.5)',
        },
      },
    },
  }

  const volumeChartConfig = {
    labels: chartData?.total_volumes.map(([timestamp]) => new Date(timestamp)),
    datasets: [
      {
        label: 'Volume',
        data: chartData?.total_volumes.map(([_, volume]) => volume),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      },
    ],
  }

  const volumeChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `Volume: $${(context.parsed.y / 1e9).toFixed(2)}B`
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: selectedTimeframe <= 1 ? 'hour' : selectedTimeframe <= 30 ? 'day' : 'month',
        },
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          callback: (value) => `$${(Number(value) / 1e9).toFixed(0)}B`,
          color: 'rgba(255, 255, 255, 0.5)',
        },
      },
    },
  }

  return (
    <div className="flex flex-col h-full bg-background" style={{ maxHeight: '90vh' }}>
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img src={crypto.image} alt={crypto.name} className="w-10 h-10" />
            <div>
              <h2 className="text-2xl font-bold">{crypto.name}</h2>
              <p className="text-muted-foreground uppercase">{crypto.symbol}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-3xl font-bold">{formatCurrency(crypto.current_price)}</p>
            <div className={`flex items-center space-x-1 mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="font-medium">{formatPercentage(crypto.price_change_percentage_24h)}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">24h High</p>
            <p className="text-lg font-semibold">{formatCurrency(crypto.high_24h)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">24h Low</p>
            <p className="text-lg font-semibold">{formatCurrency(crypto.low_24h)}</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="space-y-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Price Chart</h3>
              <div className="flex space-x-1">
                {timeframes.map((tf) => (
                  <Button
                    key={tf.label}
                    variant={selectedTimeframe === tf.days ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTimeframe(tf.days)}
                  >
                    {tf.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="h-64">
              {chartLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <Line data={chartConfig} options={chartOptions} />
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Volume Chart</h3>
            <div className="h-32">
              {chartLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <Bar data={volumeChartConfig} options={volumeChartOptions} />
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="font-semibold">{formatCurrency(crypto.market_cap)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="font-semibold">{formatCurrency(crypto.total_volume)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Circulating Supply</p>
                <p className="font-semibold">{formatNumber(crypto.circulating_supply)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Supply</p>
                <p className="font-semibold">{crypto.total_supply ? formatNumber(crypto.total_supply) : '∞'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">All Time High</p>
                <p className="font-semibold">{formatCurrency(crypto.ath)}</p>
                <p className="text-xs text-muted-foreground">{new Date(crypto.ath_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">All Time Low</p>
                <p className="font-semibold">{formatCurrency(crypto.atl)}</p>
                <p className="text-xs text-muted-foreground">{new Date(crypto.atl_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {crypto.description?.en && (
            <div>
              <h3 className="text-lg font-semibold mb-4">About {crypto.name}</h3>
              <div 
                className="text-sm text-muted-foreground prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: crypto.description.en }} 
              />
            </div>
          )}

          {crypto.links && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Links</h3>
              <div className="flex flex-wrap gap-2">
                {crypto.links.homepage[0] && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={crypto.links.homepage[0]} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Website
                    </a>
                  </Button>
                )}
                {crypto.links.subreddit_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={crypto.links.subreddit_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Reddit
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CryptoDetailsSkeleton() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div>
            <Skeleton className="h-6 w-32 mb-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
      <Skeleton className="h-64 w-full mt-4" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {[...Array(6)].map((_, i) => (
          <div key={i}>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-6 w-32" />
          </div>
        ))}
      </div>
    </div>
  )
}
