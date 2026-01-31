import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/constants/channels'
import type { IpcApi } from '../shared/types/ipc'
import type { AppConfig } from '../shared/types/config'

// Debug helper
const debugLog = (action: string, ...args: unknown[]) => {
  console.log(`[Preload IPC] ${action}:`, ...args)
}

const api: IpcApi = {
  // File operations
  readFile: (path: string) => {
    debugLog('readFile', path)
    return ipcRenderer.invoke(IPC_CHANNELS.FILE_READ, path)
  },

  writeFile: (path: string, content: string) => {
    debugLog('writeFile', path)
    return ipcRenderer.invoke(IPC_CHANNELS.FILE_WRITE, path, content)
  },

  createFile: (folderPath: string, name: string) => {
    debugLog('createFile', folderPath, name)
    return ipcRenderer.invoke(IPC_CHANNELS.FILE_CREATE, folderPath, name)
  },

  deleteFile: (path: string) => {
    debugLog('deleteFile', path)
    return ipcRenderer.invoke(IPC_CHANNELS.FILE_DELETE, path)
  },

  renameFile: (oldPath: string, newName: string) => {
    debugLog('renameFile', oldPath, newName)
    return ipcRenderer.invoke(IPC_CHANNELS.FILE_RENAME, oldPath, newName)
  },

  listFiles: (folderPath: string) => {
    debugLog('listFiles', folderPath)
    return ipcRenderer.invoke(IPC_CHANNELS.FILE_LIST, folderPath)
  },

  fileExists: (path: string) => {
    debugLog('fileExists', path)
    return ipcRenderer.invoke(IPC_CHANNELS.FILE_EXISTS, path)
  },

  // Folder operations
  selectFolder: () => {
    debugLog('selectFolder', 'requesting dialog')
    return ipcRenderer.invoke(IPC_CHANNELS.FOLDER_SELECT)
  },

  // Config operations
  getConfig: <K extends keyof AppConfig>(key: K) =>
    ipcRenderer.invoke(IPC_CHANNELS.CONFIG_GET, key),

  setConfig: <K extends keyof AppConfig>(key: K, value: AppConfig[K]) =>
    ipcRenderer.invoke(IPC_CHANNELS.CONFIG_SET, key, value),

  getAllConfig: () => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_GET_ALL),

  // Search operations
  search: (query: string) => ipcRenderer.invoke(IPC_CHANNELS.SEARCH_QUERY, query),

  buildSearchIndex: () => ipcRenderer.invoke(IPC_CHANNELS.SEARCH_BUILD_INDEX),

  // Events
  onFileChanged: (callback: (path: string, event: string) => void) => {
    const handler = (_: Electron.IpcRendererEvent, path: string, event: string) => {
      callback(path, event)
    }
    ipcRenderer.on(IPC_CHANNELS.FILE_CHANGED, handler)
    return () => {
      ipcRenderer.off(IPC_CHANNELS.FILE_CHANGED, handler)
    }
  },

  // Window operations
  minimizeWindow: () => {
    debugLog('minimizeWindow', 'sending')
    ipcRenderer.send(IPC_CHANNELS.WINDOW_MINIMIZE)
  },
  maximizeWindow: () => {
    debugLog('maximizeWindow', 'sending')
    ipcRenderer.send(IPC_CHANNELS.WINDOW_MAXIMIZE)
  },
  closeWindow: () => {
    debugLog('closeWindow', 'sending')
    ipcRenderer.send(IPC_CHANNELS.WINDOW_CLOSE)
  },
  isMaximized: () => {
    debugLog('isMaximized', 'checking')
    return ipcRenderer.invoke(IPC_CHANNELS.WINDOW_IS_MAXIMIZED)
  },
}

contextBridge.exposeInMainWorld('api', api)
