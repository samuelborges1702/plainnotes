import { create } from 'zustand'
import type { FolderSource, AppConfig } from '@shared/types/config'
import type { FileInfo } from '@shared/types/file'

// Tag extraction regex - matches #tag patterns
const TAG_REGEX = /#[a-zA-Z0-9_-]+/g

// Helper to extract tags from content
function extractTagsFromContent(content: string): string[] {
  const matches = content.match(TAG_REGEX)
  if (!matches) return []
  // Remove the # prefix and deduplicate
  return [...new Set(matches.map((tag) => tag.substring(1)))]
}

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

  // Tags
  allTags: Map<string, number> // tag name -> count
  activeTagFilter: string | null
  fileTagsCache: Map<string, string[]> // file path -> tags in that file

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

  createNote: (folderPath: string, name: string) => Promise<void>
  renameNote: (oldPath: string, newName: string) => Promise<string>
  deleteNote: (path: string) => Promise<void>

  addToRecent: (path: string) => void
  clearRecent: () => void

  setSidebarWidth: (width: number) => void
  toggleSidebar: () => void

  buildSearchIndex: () => Promise<void>

  // Tag actions
  extractAllTags: () => Promise<void>
  setTagFilter: (tag: string | null) => void
  getFilteredFiles: (sourcePath: string) => FileInfo[]
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
  allTags: new Map(),
  activeTagFilter: null,
  fileTagsCache: new Map(),
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

      // Extract tags from all files
      await get().extractAllTags()
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
    await get().extractAllTags()
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

      // Update tags for this file after save
      await get().extractAllTags()

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

  // Create a new note
  createNote: async (folderPath: string, name: string) => {
    const newPath = await window.api.createFile(folderPath, name)
    await get().refreshFileTree()
    await get().openFile(newPath)
    await get().buildSearchIndex()
  },

  // Rename a note
  renameNote: async (oldPath: string, newName: string) => {
    const currentFile = get().currentFile
    const newPath = await window.api.renameFile(oldPath, newName)

    // Update current file if it's the one being renamed
    if (currentFile?.path === oldPath) {
      const name = newPath.split(/[/\\]/).pop() || 'Untitled'
      set({
        currentFile: { ...currentFile, path: newPath, name },
      })
    }

    // Update recent files
    const recentFiles = get().recentFiles.map((p) => (p === oldPath ? newPath : p))
    set({ recentFiles })
    await window.api.setConfig('recentFiles', recentFiles)

    await get().refreshFileTree()
    await get().buildSearchIndex()
    await get().extractAllTags()

    return newPath
  },

  // Delete a note
  deleteNote: async (path: string) => {
    const currentFile = get().currentFile

    // Close file if it's the one being deleted
    if (currentFile?.path === path) {
      get().closeFile()
    }

    await window.api.deleteFile(path)
    await get().refreshFileTree()

    // Remove from recent files
    const recentFiles = get().recentFiles.filter((p) => p !== path)
    set({ recentFiles })
    await window.api.setConfig('recentFiles', recentFiles)

    // Update tags after deletion
    await get().extractAllTags()
  },

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

  // Extract all tags from all files in all sources
  extractAllTags: async () => {
    const fileTree = get().fileTree
    const allTags = new Map<string, number>()
    const fileTagsCache = new Map<string, string[]>()

    // Helper to recursively get all file paths from FileInfo tree
    const getAllFilePaths = (files: FileInfo[]): string[] => {
      const paths: string[] = []
      for (const file of files) {
        if (file.isDirectory && file.children) {
          paths.push(...getAllFilePaths(file.children))
        } else if (!file.isDirectory) {
          paths.push(file.path)
        }
      }
      return paths
    }

    // Collect all file paths
    const allFilePaths: string[] = []
    for (const files of fileTree.values()) {
      allFilePaths.push(...getAllFilePaths(files))
    }

    // Read each file and extract tags
    for (const filePath of allFilePaths) {
      try {
        const content = await window.api.readFile(filePath)
        const tags = extractTagsFromContent(content)
        fileTagsCache.set(filePath, tags)

        // Update tag counts
        for (const tag of tags) {
          allTags.set(tag, (allTags.get(tag) || 0) + 1)
        }
      } catch (error) {
        console.error(`Failed to read file for tags: ${filePath}`, error)
      }
    }

    set({ allTags, fileTagsCache })
  },

  // Set active tag filter
  setTagFilter: (tag: string | null) => {
    set({ activeTagFilter: tag })
  },

  // Get filtered files for a source based on active tag filter
  getFilteredFiles: (sourcePath: string): FileInfo[] => {
    const { fileTree, activeTagFilter, fileTagsCache } = get()
    const files = fileTree.get(sourcePath) || []

    if (!activeTagFilter) {
      return files
    }

    // Helper to filter files recursively
    const filterFiles = (fileList: FileInfo[]): FileInfo[] => {
      const result: FileInfo[] = []

      for (const file of fileList) {
        if (file.isDirectory && file.children) {
          const filteredChildren = filterFiles(file.children)
          if (filteredChildren.length > 0) {
            result.push({ ...file, children: filteredChildren })
          }
        } else if (!file.isDirectory) {
          const fileTags = fileTagsCache.get(file.path) || []
          if (fileTags.includes(activeTagFilter)) {
            result.push(file)
          }
        }
      }

      return result
    }

    return filterFiles(files)
  },
}))
