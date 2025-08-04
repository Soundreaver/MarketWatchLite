"use client"

import { useState } from 'react'
import { TrendingUp, TrendingDown, Star, StarOff } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { Cryptocurrency } from '@/lib/types'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
)

interface CryptoCardProps {
  crypto: Cryptocurrency
  isInWatchlist: boolean
  onToggleWatchlist: (id: string) => void
  onClick: () => void
}

export function CryptoCard({ crypto, isInWatchlist, onToggleWatchlist, onClick }: CryptoCardProps) {
  const isPositive = crypto.price_change_percentage_24h >= 0
  const sparklineData = crypto.sparkline_in_7d?.price || []

  const chartData = {
    labels: sparklineData.map((_, i) => i),
    datasets: [
      {
        data: sparklineData,
        borderColor: isPositive ? '#10b981' : '#ef4444',
        borderWidth: 1.5,
        fill: false,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <img src={crypto.image} alt={crypto.name} className="w-8 h-8" />
            <div>
              <h3 className="font-semibold">{crypto.name}</h3>
              <p className="text-sm text-muted-foreground uppercase">{crypto.symbol}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onToggleWatchlist(crypto.id)
            }}
          >
            {isInWatchlist ? (
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold">{formatCurrency(crypto.current_price)}</span>
            <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="font-medium">{formatPercentage(crypto.price_change_percentage_24h)}</span>
            </div>
          </div>

          {sparklineData.length > 0 && (
            <div className="h-16 mt-2">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Market Cap</p>
              <p className="font-medium">{formatCurrency(crypto.market_cap)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">24h Volume</p>
              <p className="font-medium">{formatCurrency(crypto.total_volume)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function CryptoCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          <Skeleton className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
