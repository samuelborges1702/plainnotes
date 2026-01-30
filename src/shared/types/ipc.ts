import type { AppConfig } from './config'
import type { FileInfo, SearchResult } from './file'

export interface IpcApi {
  // File operations
  readFile: (path: string) => Promise<string>
  writeFile: (path: string, content: string) => Promise<void>
  createFile: (folderPath: string, name: string) => Promise<string>
  deleteFile: (path: string) => Promise<void>
  renameFile: (oldPath: string, newName: string) => Promise<string>
  listFiles: (folderPath: string) => Promise<FileInfo[]>
  fileExists: (path: string) => Promise<boolean>

  // Folder operations
  selectFolder: () => Promise<string | null>

  // Config
  getConfig: <K extends keyof AppConfig>(key: K) => Promise<AppConfig[K]>
  setConfig: <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => Promise<void>
  getAllConfig: () => Promise<AppConfig>

  // Search
  search: (query: string) => Promise<SearchResult[]>
  buildSearchIndex: () => Promise<void>

  // Events
  onFileChanged: (callback: (path: string, event: string) => void) => () => void

  // Window
  minimizeWindow: () => void
  maximizeWindow: () => void
  closeWindow: () => void
  isMaximized: () => Promise<boolean>
}

declare global {
  interface Window {
    api: IpcApi
  }
}
