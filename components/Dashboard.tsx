"use client"

import { useState, useEffect } from 'react'
import { Download, Share2, TrendingUp, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchBar } from '@/components/SearchBar'
import { CryptoCard, CryptoCardSkeleton } from '@/components/CryptoCard'
import { CryptoDetails } from '@/components/CryptoDetails'
import { ThemeToggle } from '@/components/ThemeToggle'
import { WatchlistManager } from '@/components/WatchlistManager'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useCryptoList } from '@/hooks/useCrypto'
import { encodeWatchlist, decodeWatchlist } from '@/lib/utils'

type SortOption = 'market_cap' | 'price' | 'change_24h'

export function Dashboard() {
  const [watchlist, setWatchlist] = useLocalStorage<string[]>('crypto-watchlist', [])
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('market_cap')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Load initial data - either watchlist or default popular cryptos
  const { data: cryptos, isLoading } = useCryptoList(
    isClient && watchlist.length > 0 ? watchlist : undefined
  )

  // Handle URL-based watchlist sharing
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const sharedWatchlist = params.get('watchlist')
      if (sharedWatchlist) {
        const decoded = decodeWatchlist(sharedWatchlist)
        if (decoded.length > 0) {
          setWatchlist(decoded)
          // Clean URL
          window.history.replaceState({}, '', window.location.pathname)
        }
      }
    }
  }, [setWatchlist])

  const handleAddToWatchlist = (id: string) => {
    if (!watchlist.includes(id)) {
      setWatchlist([...watchlist, id])
    }
  }

  const handleRemoveFromWatchlist = (id: string) => {
    setWatchlist(watchlist.filter(w => w !== id))
  }

  const handleToggleWatchlist = (id: string) => {
    if (watchlist.includes(id)) {
      handleRemoveFromWatchlist(id)
    } else {
      handleAddToWatchlist(id)
    }
  }

  const handleExportWatchlist = () => {
    const data = JSON.stringify(watchlist, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'crypto-watchlist.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShareWatchlist = () => {
    const encoded = encodeWatchlist(watchlist)
    const url = `${window.location.origin}?watchlist=${encoded}`
    navigator.clipboard.writeText(url)
    // You could add a toast notification here
  }

  const sortedCryptos = cryptos ? [...cryptos].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return b.current_price - a.current_price
      case 'change_24h':
        return b.price_change_percentage_24h - a.price_change_percentage_24h
      case 'market_cap':
      default:
        return b.market_cap - a.market_cap
    }
  }) : []

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold">Crypto Dashboard</h1>
          <div className="flex items-center space-x-2">
            {isClient ? (
              <WatchlistManager 
                watchlist={watchlist}
                onUpdateWatchlist={setWatchlist}
                onRemoveFromWatchlist={handleRemoveFromWatchlist}
              />
            ) : (
              <Skeleton className="h-9 w-36" />
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6">
        <div className="mb-6">
          <SearchBar watchlist={watchlist} onAddToWatchlist={handleAddToWatchlist} />
        </div>

        {isClient && watchlist.length === 0 && (
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Welcome to Crypto Dashboard</h2>
            <p className="text-muted-foreground">
              Search and add cryptocurrencies to your watchlist to get started
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Showing popular cryptocurrencies below
            </p>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {isClient && watchlist.length > 0 ? 'Your Watchlist' : 'Popular Cryptocurrencies'}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const options: SortOption[] = ['market_cap', 'price', 'change_24h']
              const currentIndex = options.indexOf(sortBy)
              setSortBy(options[(currentIndex + 1) % options.length])
            }}
          >
            <ArrowUpDown className="h-4 w-4 mr-1" />
            Sort: {sortBy === 'market_cap' ? 'Market Cap' : sortBy === 'price' ? 'Price' : '24h Change'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => <CryptoCardSkeleton key={i} />)
          ) : (
            sortedCryptos.map((crypto) => (
              <CryptoCard
                key={crypto.id}
                crypto={crypto}
                isInWatchlist={isClient && watchlist.includes(crypto.id)}
                onToggleWatchlist={handleToggleWatchlist}
                onClick={() => setSelectedCrypto(crypto.id)}
              />
            ))
          )}
        </div>

        {isClient && !isLoading && sortedCryptos.length === 0 && watchlist.length > 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Unable to load watchlist data. Please try again later.
            </p>
          </div>
        )}
      </main>

      <Dialog open={!!selectedCrypto} onOpenChange={() => setSelectedCrypto(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          {selectedCrypto && (
            <CryptoDetails
              cryptoId={selectedCrypto}
              onClose={() => setSelectedCrypto(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
