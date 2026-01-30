import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X, FileText, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'
import type { SearchResult } from '@shared/types/file'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectResult: (result: SearchResult) => void
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const index = lowerText.indexOf(lowerQuery)

  if (index === -1) return text

  const before = text.slice(0, index)
  const match = text.slice(index, index + query.length)
  const after = text.slice(index + query.length)

  return (
    <>
      {before}
      <mark className="bg-accent-yellow/40 text-text-primary rounded px-0.5">
        {match}
      </mark>
      {after}
    </>
  )
}

export function SearchModal({ isOpen, onClose, onSelectResult }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
      setIsSearching(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      const searchResults = await window.api.search(searchQuery)
      setResults(searchResults)
      setSelectedIndex(0)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Handle input change with debounce
  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = e.target.value
      setQuery(newQuery)

      // Clear previous debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      // Set new debounce (300ms)
      debounceRef.current = setTimeout(() => {
        performSearch(newQuery)
      }, 300)
    },
    [performSearch]
  )

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          onSelectResult(results[selectedIndex])
          onClose()
        }
        break
    }
  }

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && results.length > 0) {
      const selectedElement = resultsRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      )
      selectedElement?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex, results.length])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="w-full max-w-2xl bg-bg-elevated border border-border-default rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
          <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search notes..."
            className="flex-1 bg-transparent text-text-primary placeholder-text-muted text-base focus:outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-text-muted animate-spin flex-shrink-0" />
          ) : query ? (
            <button
              onClick={() => {
                setQuery('')
                setResults([])
                inputRef.current?.focus()
              }}
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {/* Results */}
        <div
          ref={resultsRef}
          className="max-h-[60vh] overflow-y-auto"
        >
          {results.length === 0 ? (
            query.trim() && !isSearching ? (
              <div className="px-4 py-8 text-center text-text-muted">
                No results found for &ldquo;{query}&rdquo;
              </div>
            ) : !query.trim() ? (
              <div className="px-4 py-8 text-center text-text-muted">
                <p>Type to search across all your notes</p>
                <p className="mt-1 text-sm text-text-muted/70">
                  Use Ctrl+Shift+F to open search anytime
                </p>
              </div>
            ) : null
          ) : (
            <ul className="py-2">
              {results.map((result, index) => (
                <li key={result.path}>
                  <button
                    data-index={index}
                    onClick={() => {
                      onSelectResult(result)
                      onClose()
                    }}
                    className={clsx(
                      'w-full px-4 py-3 flex items-start gap-3 text-left transition-colors',
                      index === selectedIndex
                        ? 'bg-accent-cyan/10'
                        : 'hover:bg-bg-hover'
                    )}
                  >
                    <FileText
                      className={clsx(
                        'w-5 h-5 flex-shrink-0 mt-0.5',
                        index === selectedIndex ? 'text-accent-cyan' : 'text-text-muted'
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div
                        className={clsx(
                          'font-medium truncate',
                          index === selectedIndex ? 'text-accent-cyan' : 'text-text-primary'
                        )}
                      >
                        {highlightMatch(result.name, query)}
                      </div>
                      <div className="mt-1 text-sm text-text-secondary line-clamp-2">
                        {highlightMatch(result.snippet, query)}
                      </div>
                      <div className="mt-1 text-xs text-text-muted">
                        Line {result.lineNumber}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border-subtle text-xs text-text-muted">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="px-1.5 py-0.5 bg-bg-surface border border-border-subtle rounded text-[10px]">
                Enter
              </kbd>{' '}
              to select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-bg-surface border border-border-subtle rounded text-[10px]">
                Esc
              </kbd>{' '}
              to close
            </span>
          </div>
          {results.length > 0 && (
            <span>
              {results.length} result{results.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
