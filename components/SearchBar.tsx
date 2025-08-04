"use client"

import { useState, useEffect } from 'react'
import { Search, Plus, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/useDebounce'
import { useCryptoSearch } from '@/hooks/useCrypto'
import { SearchResult } from '@/lib/types'

interface SearchBarProps {
  watchlist: string[]
  onAddToWatchlist: (id: string) => void
}

export function SearchBar({ watchlist, onAddToWatchlist }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const { data: searchResults, isLoading } = useCryptoSearch(debouncedQuery)

  useEffect(() => {
    setIsOpen(debouncedQuery.length > 0 && (searchResults?.length ?? 0) > 0)
  }, [debouncedQuery, searchResults])

  const handleSelect = (crypto: SearchResult) => {
    try {
      onAddToWatchlist(crypto.id)
      setQuery('')
      setIsOpen(false)
    } catch (error) {
      console.error('Error adding to watchlist:', error)
    }
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search cryptocurrencies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>
      
      {isOpen && searchResults && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-96 overflow-auto">
          {searchResults.slice(0, 10).map((crypto) => {
            const isInWatchlist = watchlist.includes(crypto.id)
            return (
              <div
                key={crypto.id}
                className="flex items-center justify-between p-3 hover:bg-accent cursor-pointer"
                onClick={() => !isInWatchlist && handleSelect(crypto)}
              >
                <div className="flex items-center space-x-3">
                  <img src={crypto.thumb} alt={crypto.name} className="w-6 h-6" />
                  <div>
                    <p className="font-medium">{crypto.name}</p>
                    <p className="text-sm text-muted-foreground uppercase">{crypto.symbol}</p>
                  </div>
                </div>
                {isInWatchlist ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
