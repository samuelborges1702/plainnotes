import { useEffect, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { clsx } from 'clsx'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => confirmRef.current?.focus(), 50)
    }
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  if (!isOpen) return null

  const variantStyles = {
    danger: {
      icon: 'text-status-error',
      button: 'bg-status-error hover:bg-status-error/90',
    },
    warning: {
      icon: 'text-accent-orange',
      button: 'bg-accent-orange hover:bg-accent-orange/90',
    },
    info: {
      icon: 'text-accent-cyan',
      button: 'bg-accent-cyan hover:bg-accent-cyan/90',
    },
  }

  const styles = variantStyles[variant]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
      onKeyDown={handleKeyDown}
    >
      <div
        className="w-full max-w-sm bg-bg-elevated border border-border-default rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <AlertTriangle className={clsx('w-5 h-5', styles.icon)} />
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-text-secondary">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 px-4 pb-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-md transition-colors"
          >
            {cancelText}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={clsx(
              'px-4 py-2 text-sm text-white font-medium rounded-md transition-colors',
              styles.button
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
