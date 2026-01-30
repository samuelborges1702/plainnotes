import { create } from 'zustand'
import type { FolderSource, AppConfig } from '@shared/types/config'
import type { FileInfo } from '@shared/types/file'

interface AppState {
  // Config
  config: AppConfig | null
  isLoading: boolean

  // Folder Sources
  sources: FolderSource[]
  fileTree: Map<string, FileInfo[]>

  // Current File
  currentFile: {
    path: string
    name: string
    content: string
  } | null
  isDirty: boolean
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'

  // Recent Files
  recentFiles: string[]

  // UI State
  sidebarWidth: number
  isSidebarCollapsed: boolean

  // Actions
  loadConfig: () => Promise<void>
  addSource: (path: string) => Promise<void>
  removeSource: (path: string) => Promise<void>
  refreshFileTree: () => Promise<void>

  openFile: (path: string) => Promise<void>
  closeFile: () => void
  setContent: (content: string) => void
  saveFile: () => Promise<void>
  setSaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void

  addToRecent: (path: string) => void
  clearRecent: () => void

  setSidebarWidth: (width: number) => void
  toggleSidebar: () => void

  buildSearchIndex: () => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  config: null,
  isLoading: true,
  sources: [],
  fileTree: new Map(),
  currentFile: null,
  isDirty: false,
  saveStatus: 'idle',
  recentFiles: [],
  sidebarWidth: 260,
  isSidebarCollapsed: false,

  // Load config from main process
  loadConfig: async () => {
    set({ isLoading: true })
    try {
      const config = await window.api.getAllConfig()
      set({
        config,
        sources: config.sources,
        recentFiles: config.recentFiles,
        sidebarWidth: config.sidebarWidth,
        isLoading: false,
      })

      // Load file trees for all sources
      await get().refreshFileTree()
    } catch (error) {
      console.error('Failed to load config:', error)
      set({ isLoading: false })
    }
  },

  // Add a new folder source
  addSource: async (path: string) => {
    const sources = get().sources
    if (sources.some((s) => s.path === path)) return

    const name = path.split(/[/\\]/).pop() || path
    const newSource: FolderSource = {
      path,
      name,
      addedAt: Date.now(),
    }

    const updatedSources = [...sources, newSource]
    set({ sources: updatedSources })
    await window.api.setConfig('sources', updatedSources)
    await get().refreshFileTree()
    await get().buildSearchIndex()
  },

  // Remove a folder source
  removeSource: async (path: string) => {
    const sources = get().sources.filter((s) => s.path !== path)
    set({ sources })
    await window.api.setConfig('sources', sources)

    const fileTree = new Map(get().fileTree)
    fileTree.delete(path)
    set({ fileTree })
  },

  // Refresh file tree for all sources and validate them
  refreshFileTree: async () => {
    const sources = get().sources
    const fileTree = new Map<string, FileInfo[]>()
    const validatedSources: FolderSource[] = []

    for (const source of sources) {
      try {
        const exists = await window.api.fileExists(source.path)
        if (!exists) {
          validatedSources.push({
            ...source,
            isValid: false,
            error: 'Folder not found',
          })
          fileTree.set(source.path, [])
          continue
        }

        const files = await window.api.listFiles(source.path)
        validatedSources.push({
          ...source,
          isValid: true,
          error: undefined,
        })
        fileTree.set(source.path, files)
      } catch (error) {
        console.error(`Failed to list files for ${source.path}:`, error)
        validatedSources.push({
          ...source,
          isValid: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        fileTree.set(source.path, [])
      }
    }

    set({ sources: validatedSources, fileTree })
  },

  // Open a file
  openFile: async (path: string) => {
    // Save current file if dirty
    if (get().isDirty) {
      await get().saveFile()
    }

    try {
      const content = await window.api.readFile(path)
      const name = path.split(/[/\\]/).pop() || 'Untitled'

      set({
        currentFile: { path, name, content },
        isDirty: false,
        saveStatus: 'idle',
      })

      get().addToRecent(path)
    } catch (error) {
      console.error('Failed to open file:', error)
    }
  },

  // Close current file
  closeFile: () => {
    set({
      currentFile: null,
      isDirty: false,
      saveStatus: 'idle',
    })
  },

  // Set content (marks as dirty)
  setContent: (content: string) => {
    const currentFile = get().currentFile
    if (!currentFile) return

    set({
      currentFile: { ...currentFile, content },
      isDirty: true,
      saveStatus: 'idle',
    })
  },

  // Save current file
  saveFile: async () => {
    const currentFile = get().currentFile
    if (!currentFile || !get().isDirty) return

    set({ saveStatus: 'saving' })

    try {
      await window.api.writeFile(currentFile.path, currentFile.content)
      set({ isDirty: false, saveStatus: 'saved' })

      // Reset status after 2 seconds
      setTimeout(() => {
        if (get().saveStatus === 'saved') {
          set({ saveStatus: 'idle' })
        }
      }, 2000)
    } catch (error) {
      console.error('Failed to save file:', error)
      set({ saveStatus: 'error' })
    }
  },

  setSaveStatus: (status) => set({ saveStatus: status }),

  // Add to recent files
  addToRecent: (path: string) => {
    const recentFiles = get().recentFiles.filter((p) => p !== path)
    const limit = get().config?.recentFilesLimit || 10
    const updated = [path, ...recentFiles].slice(0, limit)

    set({ recentFiles: updated })
    window.api.setConfig('recentFiles', updated)
  },

  // Clear recent files
  clearRecent: () => {
    set({ recentFiles: [] })
    window.api.setConfig('recentFiles', [])
  },

  // Set sidebar width
  setSidebarWidth: (width: number) => {
    set({ sidebarWidth: width })
    window.api.setConfig('sidebarWidth', width)
  },

  // Toggle sidebar
  toggleSidebar: () => {
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }))
  },

  // Build search index
  buildSearchIndex: async () => {
    try {
      await window.api.buildSearchIndex()
    } catch (error) {
      console.error('Failed to build search index:', error)
    }
  },
}))
