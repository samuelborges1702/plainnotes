import { useState, useRef, useEffect } from 'react'
import { X, FileText } from 'lucide-react'
import { clsx } from 'clsx'

interface NewNoteModalProps {
  isOpen: boolean
  folderName: string
  onClose: () => void
  onCreate: (name: string) => Promise<void>
}

export function NewNoteModal({
  isOpen,
  folderName,
  onClose,
  onCreate,
}: NewNoteModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setName('')
      setError('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Please enter a name')
      return
    }

    // Basic validation
    if (/[<>:"/\\|?*]/.test(trimmedName)) {
      setError('Name contains invalid characters')
      return
    }

    setIsCreating(true)
    setError('')

    try {
      await onCreate(trimmedName)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note')
    } finally {
      setIsCreating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="w-full max-w-md bg-bg-elevated border border-border-default rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent-cyan" />
            <h2 className="text-lg font-semibold text-text-primary">New Note</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm text-text-secondary mb-1.5">
              Create in: <span className="text-accent-yellow">{folderName}</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter note name..."
              className={clsx(
                'w-full px-3 py-2 bg-bg-surface border rounded-md text-text-primary placeholder-text-muted',
                'focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan',
                error ? 'border-status-error' : 'border-border-default'
              )}
              disabled={isCreating}
            />
            <p className="mt-1 text-xs text-text-muted">.txt extension will be added automatically</p>
            {error && <p className="mt-1.5 text-sm text-status-error">{error}</p>}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-md transition-colors"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-accent-cyan text-bg-base font-medium rounded-md hover:bg-accent-cyan/90 transition-colors disabled:opacity-50"
              disabled={isCreating || !name.trim()}
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
