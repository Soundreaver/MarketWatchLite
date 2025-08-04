"use client"

import { useState } from 'react'
import { Trash2, Download, Upload, X, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { CryptoCard } from '@/components/CryptoCard'
import { useCryptoList } from '@/hooks/useCrypto'

interface WatchlistManagerProps {
  watchlist: string[]
  onUpdateWatchlist: (watchlist: string[]) => void
  onRemoveFromWatchlist: (id: string) => void
}

export function WatchlistManager({ 
  watchlist, 
  onUpdateWatchlist, 
  onRemoveFromWatchlist 
}: WatchlistManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [importError, setImportError] = useState<string>('')
  const { data: cryptos, isLoading } = useCryptoList(watchlist.length > 0 ? watchlist : undefined)

  const handleExportWatchlist = () => {
    const data = JSON.stringify(watchlist, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crypto-watchlist-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportWatchlist = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportError('')
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedWatchlist = JSON.parse(content)
        
        if (!Array.isArray(importedWatchlist)) {
          throw new Error('Invalid format: Expected an array of cryptocurrency IDs')
        }
        
        // Validate that all items are strings
        if (!importedWatchlist.every(item => typeof item === 'string')) {
          throw new Error('Invalid format: All items must be strings')
        }
        
        // Merge with existing watchlist, avoiding duplicates
        const combinedWatchlist = Array.from(new Set([...watchlist, ...importedWatchlist]))
        onUpdateWatchlist(combinedWatchlist)
        
        // Reset file input
        event.target.value = ''
      } catch (error) {
        setImportError(error instanceof Error ? error.message : 'Failed to import watchlist')
      }
    }
    
    reader.readAsText(file)
  }

  const handleClearWatchlist = () => {
    if (window.confirm('Are you sure you want to clear your entire watchlist?')) {
      onUpdateWatchlist([])
      setIsOpen(false)
    }
  }

  const handleRemoveMultiple = (idsToRemove: string[]) => {
    const updatedWatchlist = watchlist.filter(id => !idsToRemove.includes(id))
    onUpdateWatchlist(updatedWatchlist)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-1" />
          Manage Watchlist ({watchlist.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Watchlist Manager</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Actions */}
          <div className="flex flex-wrap gap-2 border-b pb-4">
            <Button variant="outline" size="sm" onClick={handleExportWatchlist}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            
            <div className="relative">
              <Input
                type="file"
                accept=".json"
                onChange={handleImportWatchlist}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="import-file"
              />
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="import-file" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-1" />
                  Import
                </label>
              </Button>
            </div>
            
            {watchlist.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleClearWatchlist}>
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
          
          {importError && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-3 py-2 rounded text-sm">
              {importError}
            </div>
          )}
          
          {/* Watchlist Items */}
          <div className="max-h-96 overflow-y-auto">
            {watchlist.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Your watchlist is empty.</p>
                <p className="text-sm mt-1">Add some cryptocurrencies to get started!</p>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-24 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {cryptos?.map((crypto) => (
                  <div key={crypto.id} className="flex items-center justify-between p-3 border rounded hover:bg-accent">
                    <div className="flex items-center space-x-3 flex-1">
                      <img src={crypto.image} alt={crypto.name} className="w-8 h-8" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{crypto.name}</p>
                            <p className="text-sm text-muted-foreground uppercase">{crypto.symbol}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${crypto.current_price.toFixed(2)}</p>
                            <p className={`text-sm ${
                              crypto.price_change_percentage_24h >= 0 
                                ? 'text-green-500' 
                                : 'text-red-500'
                            }`}>
                              {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                              {crypto.price_change_percentage_24h.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveFromWatchlist(crypto.id)}
                      className="ml-2 text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {watchlist.length > 0 && (
            <div className="text-sm text-muted-foreground text-center border-t pt-4">
              Total: {watchlist.length} cryptocurrencies in your watchlist
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
