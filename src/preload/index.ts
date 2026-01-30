import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/constants/channels'
import type { IpcApi } from '../shared/types/ipc'
import type { AppConfig } from '../shared/types/config'

const api: IpcApi = {
  // File operations
  readFile: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE_READ, path),

  writeFile: (path: string, content: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_WRITE, path, content),

  createFile: (folderPath: string, name: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_CREATE, folderPath, name),

  deleteFile: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE_DELETE, path),

  renameFile: (oldPath: string, newName: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_RENAME, oldPath, newName),

  listFiles: (folderPath: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE_LIST, folderPath),

  fileExists: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE_EXISTS, path),

  // Folder operations
  selectFolder: () => ipcRenderer.invoke(IPC_CHANNELS.FOLDER_SELECT),

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
  minimizeWindow: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MINIMIZE),
  maximizeWindow: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MAXIMIZE),
  closeWindow: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_CLOSE),
  isMaximized: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_IS_MAXIMIZED),
}

contextBridge.exposeInMainWorld('api', api)
