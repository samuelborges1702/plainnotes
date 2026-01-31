import { app, BrowserWindow, shell } from 'electron'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { registerIpcHandlers } from './ipc'
import { ConfigStore } from './services/ConfigStore'

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let mainWindow: BrowserWindow | null = null

const configStore = new ConfigStore()

function createWindow(): void {
  const bounds = configStore.get('windowBounds')

  // Platform-specific window configuration
  const isMac = process.platform === 'darwin'
  const isWin = process.platform === 'win32'

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#141414',
    frame: false, // Custom title bar on all platforms
    // macOS specific
    ...(isMac && {
      titleBarStyle: 'hidden',
      trafficLightPosition: { x: 16, y: 16 },
    }),
    // Windows specific - ensure proper frameless window
    ...(isWin && {
      titleBarStyle: 'hidden',
      titleBarOverlay: false,
    }),
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  })

  // Register IPC handlers
  registerIpcHandlers(mainWindow, configStore)

  // Save window bounds on resize/move
  mainWindow.on('resize', () => {
    if (mainWindow && !mainWindow.isMaximized()) {
      const [width, height] = mainWindow.getSize()
      configStore.set('windowBounds', { ...configStore.get('windowBounds'), width, height })
    }
  })

  mainWindow.on('move', () => {
    if (mainWindow && !mainWindow.isMaximized()) {
      const [x, y] = mainWindow.getPosition()
      configStore.set('windowBounds', { ...configStore.get('windowBounds'), x, y })
    }
  })

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// App lifecycle
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Export for IPC handlers
export { mainWindow, configStore }
