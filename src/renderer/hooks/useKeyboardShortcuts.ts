import { useEffect, useCallback } from 'react'

interface KeyboardShortcutHandlers {
  onNewNote?: () => void
  onSave?: () => void
  onQuickOpen?: () => void
  onGlobalSearch?: () => void
  onSettings?: () => void
  onCloseModal?: () => void
}

interface ModalState {
  isNewNoteModalOpen: boolean
  isQuickOpenModalOpen: boolean
  isSettingsModalOpen: boolean
  isGlobalSearchOpen: boolean
  isAnyModalOpen: boolean
}

export function useKeyboardShortcuts(
  handlers: KeyboardShortcutHandlers,
  modalState: ModalState
) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey

      // Esc: Close any open modal
      if (e.key === 'Escape') {
        if (modalState.isAnyModalOpen && handlers.onCloseModal) {
          e.preventDefault()
          handlers.onCloseModal()
        }
        return
      }

      // Don't trigger shortcuts if user is typing in input/textarea (except Esc)
      const target = e.target as HTMLElement
      const isEditing =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('.cm-content') // CodeMirror editor

      // Ctrl+S: Save (allow even when editing)
      if (isMod && e.key === 's') {
        e.preventDefault()
        handlers.onSave?.()
        return
      }

      // Skip other shortcuts if editing in form fields (but allow in CodeMirror since Ctrl+S is handled there)
      if (isEditing && !target.closest('.cm-content')) {
        return
      }

      // If a modal is open, don't trigger other shortcuts
      if (modalState.isAnyModalOpen) {
        return
      }

      // Ctrl+N: New note
      if (isMod && e.key === 'n') {
        e.preventDefault()
        handlers.onNewNote?.()
        return
      }

      // Ctrl+P: Quick open
      if (isMod && e.key === 'p') {
        e.preventDefault()
        handlers.onQuickOpen?.()
        return
      }

      // Ctrl+Shift+F: Global search
      if (isMod && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        handlers.onGlobalSearch?.()
        return
      }

      // Ctrl+,: Settings
      if (isMod && e.key === ',') {
        e.preventDefault()
        handlers.onSettings?.()
        return
      }
    },
    [handlers, modalState]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
