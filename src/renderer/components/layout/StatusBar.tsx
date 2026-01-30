import { Search, FilePlus, Settings } from 'lucide-react'
import { useAppStore } from '../../stores/appStore'

interface StatusBarProps {
  onOpenSearch?: () => void
  onOpenQuickOpen?: () => void
  onOpenSettings?: () => void
  onNewNote?: () => void
}

export function StatusBar({
  onOpenSearch,
  onOpenQuickOpen,
  onOpenSettings,
  onNewNote,
}: StatusBarProps) {
  const { currentFile, isDirty, sources } = useAppStore()

  const wordCount = currentFile ? countWords(currentFile.content) : 0
  const charCount = currentFile ? currentFile.content.length : 0
  const lineCount = currentFile ? currentFile.content.split('\n').length : 0

  return (
    <footer className="flex items-center justify-between h-7 px-4 bg-bg-elevated border-t border-border-subtle text-xs text-text-muted select-none">
      {/* Left side - Status info */}
      <div className="flex items-center gap-4">
        <span>{sources.length} folder(s)</span>
        {currentFile && (
          <>
            <span className="text-border-default">|</span>
            <span className={isDirty ? 'text-accent-orange' : ''}>{isDirty ? 'Unsaved' : 'Saved'}</span>
          </>
        )}
      </div>

      {/* Center - Quick action buttons */}
      <div className="flex items-center gap-1">
        {onNewNote && sources.length > 0 && (
          <button
            onClick={onNewNote}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-bg-hover hover:text-text-primary transition-colors"
            title="New Note (Ctrl+N)"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New</span>
            <kbd className="hidden sm:inline text-[9px] px-1 py-0.5 rounded bg-bg-surface border border-border-subtle">
              Ctrl+N
            </kbd>
          </button>
        )}
        {onOpenQuickOpen && (
          <button
            onClick={onOpenQuickOpen}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-bg-hover hover:text-text-primary transition-colors"
            title="Quick Open (Ctrl+P)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open</span>
            <kbd className="hidden sm:inline text-[9px] px-1 py-0.5 rounded bg-bg-surface border border-border-subtle">
              Ctrl+P
            </kbd>
          </button>
        )}
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-bg-hover hover:text-text-primary transition-colors"
            title="Search Notes (Ctrl+Shift+F)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline text-[9px] px-1 py-0.5 rounded bg-bg-surface border border-border-subtle">
              Ctrl+Shift+F
            </kbd>
          </button>
        )}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-bg-hover hover:text-text-primary transition-colors"
            title="Settings (Ctrl+,)"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right side - File stats */}
      {currentFile && (
        <div className="flex items-center gap-4">
          <span>{lineCount} lines</span>
          <span>{wordCount} words</span>
          <span>{charCount} chars</span>
        </div>
      )}
    </footer>
  )
}

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length
}
