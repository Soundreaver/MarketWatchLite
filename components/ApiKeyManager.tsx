"use client"

import { useState } from 'react'
import { Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ApiKeyManagerProps {
  apiKey: string
  onSave: (key: string) => void
}

export function ApiKeyManager({ apiKey, onSave }: ApiKeyManagerProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(apiKey)

  const handleSave = () => {
    onSave(inputValue.trim())
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Key className="h-4 w-4" />
          <span className="hidden sm:inline">
            {apiKey ? 'API Key Saved' : 'Set API Key'}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configure Google Gemini API Key</DialogTitle>
          <DialogDescription>
            Enter your Google Gemini API key to enable AI-powered market analysis. 
            This key is stored locally in your browser and is never saved to our database.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="apiKey"
            placeholder="AIzaSy..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            type="password"
          />
          <div className="text-xs text-muted-foreground">
            Get a free API key from{' '}
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google AI Studio
            </a>.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Key</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
