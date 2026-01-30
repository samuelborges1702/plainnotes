import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, FileText, Folder } from 'lucide-react'
import { clsx } from 'clsx'
import { useAppStore } from '../../stores/appStore'
import type { FileInfo } from '@shared/types/file'

interface QuickOpenModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FlattenedFile {
  path: string
  name: string
  folderName: string
  folderPath: string
}

export function QuickOpenModal({ isOpen, onClose }: QuickOpenModalProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { sources, fileTree, openFile } = useAppStore()

  // Flatten all files from all sources
  const allFiles = useMemo(() => {
    const files: FlattenedFile[] = []

    const flattenFiles = (
      fileList: FileInfo[],
      folderName: string,
      folderPath: string
    ) => {
      for (const file of fileList) {
        if (file.isDirectory && file.children) {
          flattenFiles(file.children, folderName, folderPath)
        } else if (!file.isDirectory) {
          files.push({
            path: file.path,
            name: file.name.replace('.txt', ''),
            folderName,
            folderPath,
          })
        }
      }
    }

    for (const source of sources) {
      const sourceFiles = fileTree.get(source.path) || []
      flattenFiles(sourceFiles, source.name, source.path)
    }

    return files
  }, [sources, fileTree])

  // Filter files based on query
  const filteredFiles = useMemo(() => {
    if (!query.trim()) {
      return allFiles.slice(0, 20) // Show first 20 files when no query
    }

    const lowerQuery = query.toLowerCase()
    return allFiles
      .filter(
        (file) =>
          file.name.toLowerCase().includes(lowerQuery) ||
          file.folderName.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 20)
  }, [allFiles, query])

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Reset selection when filtered files change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredFiles.length])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      )
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        onClose()
        break
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) =>
          Math.min(prev + 1, filteredFiles.length - 1)
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (filteredFiles[selectedIndex]) {
          handleSelectFile(filteredFiles[selectedIndex].path)
        }
        break
    }
  }

  const handleSelectFile = async (path: string) => {
    await openFile(path)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-bg-elevated border border-border-default rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
          <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes by name..."
            className="flex-1 bg-transparent text-text-primary placeholder-text-muted focus:outline-none text-base"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-bg-surface border border-border-default text-text-muted">
            Esc
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-80 overflow-y-auto">
          {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-text-muted">
              <FileText className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">
                {query ? 'No notes found' : 'No notes available'}
              </p>
            </div>
          ) : (
            filteredFiles.map((file, index) => (
              <button
                key={file.path}
                data-index={index}
                onClick={() => handleSelectFile(file.path)}
                className={clsx(
                  'flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors',
                  index === selectedIndex
                    ? 'bg-accent-cyan/20 text-text-primary'
                    : 'text-text-secondary hover:bg-bg-hover'
                )}
              >
                <FileText
                  className={clsx(
                    'w-4 h-4 flex-shrink-0',
                    index === selectedIndex
                      ? 'text-accent-cyan'
                      : 'text-text-muted'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {highlightMatch(file.name, query)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <Folder className="w-3 h-3" />
                    <span className="truncate">{file.folderName}</span>
                  </div>
                </div>
                {index === selectedIndex && (
                  <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-bg-surface border border-border-default text-text-muted">
                    Enter
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer with hints */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border-subtle text-xs text-text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-bg-surface border border-border-default">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-bg-surface border border-border-default">
                Enter
              </kbd>
              Open
            </span>
          </div>
          <span>{filteredFiles.length} notes</span>
        </div>
      </div>
    </div>
  )
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const index = lowerText.indexOf(lowerQuery)

  if (index === -1) return text

  return (
    <>
      {text.substring(0, index)}
      <span className="text-accent-cyan font-semibold">
        {text.substring(index, index + query.length)}
      </span>
      {text.substring(index + query.length)}
    </>
  )
}
