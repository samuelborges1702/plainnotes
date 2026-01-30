import { useAppStore } from '../../stores/appStore'

export function StatusBar() {
  const { currentFile, isDirty, sources } = useAppStore()

  const wordCount = currentFile ? countWords(currentFile.content) : 0
  const charCount = currentFile ? currentFile.content.length : 0
  const lineCount = currentFile ? currentFile.content.split('\n').length : 0

  return (
    <footer className="flex items-center justify-between h-6 px-4 bg-bg-elevated border-t border-border-subtle text-xs text-text-muted select-none">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <span>{sources.length} folder(s)</span>
        {currentFile && (
          <>
            <span className="text-border-default">|</span>
            <span>{isDirty ? 'Unsaved' : 'Saved'}</span>
          </>
        )}
      </div>

      {/* Right side */}
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
