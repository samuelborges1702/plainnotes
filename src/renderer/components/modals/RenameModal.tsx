import { useState, useRef, useEffect } from 'react'
import { X, Edit3 } from 'lucide-react'
import { clsx } from 'clsx'

interface RenameModalProps {
  isOpen: boolean
  currentName: string
  onClose: () => void
  onRename: (newName: string) => Promise<void>
}

export function RenameModal({
  isOpen,
  currentName,
  onClose,
  onRename,
}: RenameModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isRenaming, setIsRenaming] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      // Remove .txt extension for editing
      const nameWithoutExt = currentName.replace(/\.txt$/i, '')
      setName(nameWithoutExt)
      setError('')
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 50)
    }
  }, [isOpen, currentName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Please enter a name')
      return
    }

    // Check if name is the same
    const currentWithoutExt = currentName.replace(/\.txt$/i, '')
    if (trimmedName === currentWithoutExt) {
      onClose()
      return
    }

    // Basic validation
    if (/[<>:"/\\|?*]/.test(trimmedName)) {
      setError('Name contains invalid characters')
      return
    }

    setIsRenaming(true)
    setError('')

    try {
      await onRename(trimmedName)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename note')
    } finally {
      setIsRenaming(false)
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
            <Edit3 className="w-5 h-5 text-accent-cyan" />
            <h2 className="text-lg font-semibold text-text-primary">Rename Note</h2>
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
              New name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter new name..."
              className={clsx(
                'w-full px-3 py-2 bg-bg-surface border rounded-md text-text-primary placeholder-text-muted',
                'focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan',
                error ? 'border-status-error' : 'border-border-default'
              )}
              disabled={isRenaming}
            />
            <p className="mt-1 text-xs text-text-muted">.txt extension will be kept automatically</p>
            {error && <p className="mt-1.5 text-sm text-status-error">{error}</p>}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-md transition-colors"
              disabled={isRenaming}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-accent-cyan text-bg-base font-medium rounded-md hover:bg-accent-cyan/90 transition-colors disabled:opacity-50"
              disabled={isRenaming || !name.trim()}
            >
              {isRenaming ? 'Renaming...' : 'Rename'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
