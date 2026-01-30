import { useEffect, useRef } from 'react'
import { Settings, X, Keyboard } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeButtonRef.current?.focus(), 50)
    }
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  if (!isOpen) return null

  const shortcuts = [
    { key: 'Ctrl+N', description: 'New note' },
    { key: 'Ctrl+S', description: 'Save note' },
    { key: 'Ctrl+P', description: 'Quick open' },
    { key: 'Ctrl+Shift+F', description: 'Global search' },
    { key: 'Ctrl+,', description: 'Settings' },
    { key: 'Esc', description: 'Close modal' },
  ]

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
            <Settings className="w-5 h-5 text-accent-cyan" />
            <h2 className="text-lg font-semibold text-text-primary">Settings</h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Keyboard Shortcuts Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Keyboard className="w-4 h-4 text-accent-purple" />
              <h3 className="text-sm font-medium text-text-primary">
                Keyboard Shortcuts
              </h3>
            </div>
            <div className="space-y-2">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.key}
                  className="flex items-center justify-between py-1.5 px-2 rounded bg-bg-surface"
                >
                  <span className="text-sm text-text-secondary">
                    {shortcut.description}
                  </span>
                  <kbd className="text-xs px-2 py-1 rounded bg-bg-elevated border border-border-default text-text-muted font-mono">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Placeholder for future settings */}
          <div className="text-center py-6 border-t border-border-subtle">
            <p className="text-sm text-text-muted">
              More settings coming soon...
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-4 py-3 border-t border-border-subtle">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-accent-cyan text-bg-base font-medium rounded-md hover:bg-accent-cyan/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
