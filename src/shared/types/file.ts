export interface FileInfo {
  name: string
  path: string
  isDirectory: boolean
  size?: number
  modifiedAt?: number
  children?: FileInfo[]
}

export interface SearchResult {
  path: string
  name: string
  snippet: string
  matchIndex: number
  lineNumber: number
}
