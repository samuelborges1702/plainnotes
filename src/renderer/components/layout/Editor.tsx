import { useEffect, useCallback } from 'react'
import { FileText, Save } from 'lucide-react'
import { useAppStore } from '../../stores/appStore'
import { MarkdownEditor } from '../editor/MarkdownEditor'
import { clsx } from 'clsx'

export function Editor() {
  const { currentFile, isDirty, saveStatus, setContent, saveFile } = useAppStore()

  // Autosave with debounce
  useEffect(() => {
    if (!isDirty) return

    const timer = setTimeout(() => {
      saveFile()
    }, 1500)

    return () => clearTimeout(timer)
  }, [currentFile?.content, isDirty, saveFile])

  const handleChange = useCallback(
    (content: string) => {
      setContent(content)
    },
    [setContent]
  )

  const handleSave = useCallback(() => {
    saveFile()
  }, [saveFile])

  if (!currentFile) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-bg-base">
        <FileText className="w-16 h-16 text-text-muted mb-4" />
        <h2 className="text-xl font-medium text-text-secondary mb-2">No note selected</h2>
        <p className="text-sm text-text-muted">Select a note from the sidebar to start editing</p>
      </main>
    )
  }

  return (
    <main className="flex-1 flex flex-col bg-bg-base overflow-hidden">
      {/* Editor Header */}
      <header className="flex items-center justify-between h-12 px-4 border-b border-border-subtle bg-bg-elevated">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-accent-cyan" />
          <h1 className="text-base font-medium text-text-primary">
            {currentFile.name.replace('.txt', '')}
          </h1>
          {isDirty && <span className="w-2 h-2 rounded-full bg-accent-orange" title="Unsaved" />}
        </div>

        <div className="flex items-center gap-2">
          <SaveStatus status={saveStatus} />
          <button
            onClick={saveFile}
            disabled={!isDirty}
            className={clsx(
              'btn-ghost text-xs',
              isDirty ? 'text-text-primary' : 'text-text-muted cursor-not-allowed'
            )}
          >
            <Save className="w-4 h-4" />
            <kbd className="text-[10px] px-1 py-0.5 rounded bg-bg-surface border border-border-default">
              Ctrl+S
            </kbd>
          </button>
        </div>
      </header>

      {/* Editor Content - CodeMirror with Markdown Live Preview */}
      <div className="flex-1 overflow-hidden">
        <MarkdownEditor
          content={currentFile.content}
          onChange={handleChange}
          onSave={handleSave}
        />
      </div>
    </main>
  )
}

interface SaveStatusProps {
  status: 'idle' | 'saving' | 'saved' | 'error'
}

function SaveStatus({ status }: SaveStatusProps) {
  if (status === 'idle') return null

  const statusConfig = {
    saving: { text: 'Saving...', class: 'text-accent-yellow' },
    saved: { text: 'Saved', class: 'text-accent-green' },
    error: { text: 'Error saving', class: 'text-status-error' },
  }

  const config = statusConfig[status]

  return <span className={clsx('text-xs', config.class)}>{config.text}</span>
}
