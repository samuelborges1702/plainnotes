export const IPC_CHANNELS = {
  // File Operations
  FILE_READ: 'file:read',
  FILE_WRITE: 'file:write',
  FILE_CREATE: 'file:create',
  FILE_DELETE: 'file:delete',
  FILE_RENAME: 'file:rename',
  FILE_LIST: 'file:list',
  FILE_EXISTS: 'file:exists',
  FILE_CHANGED: 'file:changed',

  // Folder Operations
  FOLDER_SELECT: 'folder:select',

  // Config Operations
  CONFIG_GET: 'config:get',
  CONFIG_SET: 'config:set',
  CONFIG_GET_ALL: 'config:get-all',

  // Search Operations
  SEARCH_QUERY: 'search:query',
  SEARCH_BUILD_INDEX: 'search:build-index',

  // Window Operations
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_IS_MAXIMIZED: 'window:is-maximized',
} as const

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]
