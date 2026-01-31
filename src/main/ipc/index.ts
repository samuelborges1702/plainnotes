import { BrowserWindow, ipcMain, dialog } from 'electron'
import { IPC_CHANNELS } from '@shared/constants/channels'
import { ConfigStore } from '../services/ConfigStore'
import { fileService } from '../services/FileService'
import { searchIndex } from '../services/SearchIndex'
import type { AppConfig } from '@shared/types/config'

// Debug helper
const debugLog = (action: string, ...args: unknown[]) => {
  console.log(`[Main IPC] ${action}:`, ...args)
}

export function registerIpcHandlers(mainWindow: BrowserWindow, configStore: ConfigStore): void {
  debugLog('registerIpcHandlers', 'Starting registration...')

  // Initialize file service with allowed roots from config
  const updateAllowedRoots = () => {
    const sources = configStore.get('sources')
    fileService.setAllowedRoots(sources.map((s) => s.path))
    debugLog('updateAllowedRoots', sources.length, 'sources configured')
  }
  updateAllowedRoots()

  // File operations
  ipcMain.handle(IPC_CHANNELS.FILE_READ, async (_, path: string) => {
    return fileService.read(path)
  })

  ipcMain.handle(IPC_CHANNELS.FILE_WRITE, async (_, path: string, content: string) => {
    await fileService.write(path, content)
    searchIndex.updateFile(path, content)
  })

  ipcMain.handle(IPC_CHANNELS.FILE_CREATE, async (_, folderPath: string, name: string) => {
    return fileService.create(folderPath, name)
  })

  ipcMain.handle(IPC_CHANNELS.FILE_DELETE, async (_, path: string) => {
    await fileService.delete(path)
    searchIndex.removeFile(path)
  })

  ipcMain.handle(IPC_CHANNELS.FILE_RENAME, async (_, oldPath: string, newName: string) => {
    const newPath = await fileService.rename(oldPath, newName)
    searchIndex.removeFile(oldPath)
    return newPath
  })

  ipcMain.handle(IPC_CHANNELS.FILE_LIST, async (_, folderPath: string) => {
    return fileService.list(folderPath)
  })

  ipcMain.handle(IPC_CHANNELS.FILE_EXISTS, async (_, path: string) => {
    return fileService.exists(path)
  })

  // Folder operations
  ipcMain.handle(IPC_CHANNELS.FOLDER_SELECT, async () => {
    debugLog('FOLDER_SELECT', 'Handler called, showing dialog...')
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        title: 'Select Notes Folder',
      })

      debugLog('FOLDER_SELECT', 'Dialog result:', result)

      if (result.canceled || result.filePaths.length === 0) {
        debugLog('FOLDER_SELECT', 'Canceled or no selection')
        return null
      }

      debugLog('FOLDER_SELECT', 'Selected path:', result.filePaths[0])
      return result.filePaths[0]
    } catch (error) {
      debugLog('FOLDER_SELECT', 'ERROR:', error)
      throw error
    }
  })

  // Config operations
  ipcMain.handle(IPC_CHANNELS.CONFIG_GET, (_, key: keyof AppConfig) => {
    return configStore.get(key)
  })

  ipcMain.handle(IPC_CHANNELS.CONFIG_SET, (_, key: keyof AppConfig, value: unknown) => {
    configStore.set(key, value as AppConfig[keyof AppConfig])

    // Update file service allowed roots when sources change
    if (key === 'sources') {
      updateAllowedRoots()
    }
  })

  ipcMain.handle(IPC_CHANNELS.CONFIG_GET_ALL, () => {
    return configStore.getAll()
  })

  // Search operations
  ipcMain.handle(IPC_CHANNELS.SEARCH_QUERY, (_, query: string) => {
    return searchIndex.search(query)
  })

  ipcMain.handle(IPC_CHANNELS.SEARCH_BUILD_INDEX, async () => {
    const sources = configStore.get('sources')
    await searchIndex.buildIndex(sources)
  })

  // Window operations
  ipcMain.on(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    debugLog('WINDOW_MINIMIZE', 'Handler called')
    mainWindow.minimize()
  })

  ipcMain.on(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
    debugLog('WINDOW_MAXIMIZE', 'Handler called, isMaximized:', mainWindow.isMaximized())
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })

  ipcMain.on(IPC_CHANNELS.WINDOW_CLOSE, () => {
    debugLog('WINDOW_CLOSE', 'Handler called')
    mainWindow.close()
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_IS_MAXIMIZED, () => {
    const result = mainWindow.isMaximized()
    debugLog('WINDOW_IS_MAXIMIZED', 'Result:', result)
    return result
  })

  debugLog('registerIpcHandlers', 'All handlers registered successfully!')
}
