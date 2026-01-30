export interface FolderSource {
  path: string
  name: string
  addedAt: number
  isValid?: boolean
  error?: string
}

export interface WindowBounds {
  x?: number
  y?: number
  width: number
  height: number
}

export interface AppConfig {
  sources: FolderSource[]
  recentFiles: string[]
  recentFilesLimit: number
  autosaveEnabled: boolean
  autosaveDelay: number
  sidebarWidth: number
  windowBounds: WindowBounds
}

export const DEFAULT_CONFIG: AppConfig = {
  sources: [],
  recentFiles: [],
  recentFilesLimit: 10,
  autosaveEnabled: true,
  autosaveDelay: 1500,
  sidebarWidth: 260,
  windowBounds: {
    width: 1200,
    height: 800,
  },
}
