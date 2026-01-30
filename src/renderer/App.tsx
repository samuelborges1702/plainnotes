import { useEffect, useState, useCallback } from 'react'
import { TitleBar } from './components/layout/TitleBar'
import { Sidebar } from './components/layout/Sidebar'
import { Editor } from './components/layout/Editor'
import { StatusBar } from './components/layout/StatusBar'
import { FloatingActionButton } from './components/layout/FloatingActionButton'
import { SearchModal } from './components/modals/SearchModal'
import { QuickOpenModal } from './components/modals/QuickOpenModal'
import { SettingsModal } from './components/modals/SettingsModal'
import { NewNoteModal } from './components/modals/NewNoteModal'
import { useAppStore } from './stores/appStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import type { SearchResult } from '@shared/types/file'

function App() {
  const { loadConfig, buildSearchIndex, openFile, sources, createNote, saveFile } =
    useAppStore()

  // Modal states
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isQuickOpenOpen, setIsQuickOpenOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false)

  useEffect(() => {
    // Initialize app
    const init = async () => {
      await loadConfig()
      await buildSearchIndex()
    }
    init()
  }, [loadConfig, buildSearchIndex])

  // Handle search result selection
  const handleSearchResultSelect = useCallback(
    async (result: SearchResult) => {
      await openFile(result.path)
      // Dispatch custom event to scroll to line number
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('scroll-to-line', {
            detail: { lineNumber: result.lineNumber },
          })
        )
      }, 100)
    },
    [openFile]
  )

  // Handlers for keyboard shortcuts
  const handleNewNote = useCallback(() => {
    if (sources.length > 0) {
      setIsNewNoteOpen(true)
    }
  }, [sources])

  const handleSave = useCallback(() => {
    saveFile()
  }, [saveFile])

  const handleQuickOpen = useCallback(() => {
    setIsQuickOpenOpen(true)
  }, [])

  const handleGlobalSearch = useCallback(() => {
    setIsSearchOpen(true)
  }, [])

  const handleSettings = useCallback(() => {
    setIsSettingsOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    // Close modals in priority order (newest first)
    if (isSearchOpen) setIsSearchOpen(false)
    else if (isNewNoteOpen) setIsNewNoteOpen(false)
    else if (isQuickOpenOpen) setIsQuickOpenOpen(false)
    else if (isSettingsOpen) setIsSettingsOpen(false)
  }, [isSearchOpen, isNewNoteOpen, isQuickOpenOpen, isSettingsOpen])

  // Use keyboard shortcuts hook
  useKeyboardShortcuts(
    {
      onNewNote: handleNewNote,
      onSave: handleSave,
      onQuickOpen: handleQuickOpen,
      onGlobalSearch: handleGlobalSearch,
      onSettings: handleSettings,
      onCloseModal: handleCloseModal,
    },
    {
      isNewNoteModalOpen: isNewNoteOpen,
      isQuickOpenModalOpen: isQuickOpenOpen,
      isSettingsModalOpen: isSettingsOpen,
      isGlobalSearchOpen: isSearchOpen,
      isAnyModalOpen:
        isNewNoteOpen || isQuickOpenOpen || isSettingsOpen || isSearchOpen,
    }
  )

  // Get first source for quick new note
  const firstSource = sources[0]

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onOpenSettings={handleSettings} />
        <Editor />
      </div>
      <StatusBar
        onNewNote={handleNewNote}
        onOpenQuickOpen={handleQuickOpen}
        onOpenSearch={handleGlobalSearch}
        onOpenSettings={handleSettings}
      />

      {/* Global Search Modal (Ctrl+Shift+F) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleSearchResultSelect}
      />

      {/* Quick Open Modal (Ctrl+P) */}
      <QuickOpenModal
        isOpen={isQuickOpenOpen}
        onClose={() => setIsQuickOpenOpen(false)}
      />

      {/* Settings Modal (Ctrl+,) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* New Note Modal (Ctrl+N) */}
      {firstSource && (
        <NewNoteModal
          isOpen={isNewNoteOpen}
          folderName={firstSource.name}
          onClose={() => setIsNewNoteOpen(false)}
          onCreate={(name) => createNote(firstSource.path, name)}
        />
      )}

      {/* Floating Action Button */}
      <FloatingActionButton
        onSearch={handleGlobalSearch}
        onQuickOpen={handleQuickOpen}
        onSettings={handleSettings}
        onNewNote={sources.length > 0 ? handleNewNote : undefined}
      />
    </div>
  )
}

export default App
