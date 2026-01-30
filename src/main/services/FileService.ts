import { promises as fs } from 'fs'
import { join, dirname, extname } from 'path'
import { FileInfo } from '@shared/types/file'
import {
  isPathWithinRoots,
  sanitizeFilename,
  ensureTxtExtension,
  isValidTxtPath,
} from '../utils/paths'

export class FileService {
  private allowedRoots: string[] = []

  /**
   * Set the allowed root directories for file operations.
   * This should be called with the configured folder sources.
   */
  setAllowedRoots(roots: string[]): void {
    this.allowedRoots = roots
  }

  /**
   * Validates that a path is within allowed roots.
   * Throws an error if path traversal is detected.
   */
  private validatePath(filePath: string): void {
    if (this.allowedRoots.length === 0) {
      // No roots configured yet, allow operation
      return
    }

    if (!isPathWithinRoots(filePath, this.allowedRoots)) {
      throw new Error(`Access denied: Path is outside allowed directories`)
    }
  }

  async read(filePath: string): Promise<string> {
    this.validatePath(filePath)

    if (!isValidTxtPath(filePath)) {
      throw new Error('Invalid file path: must be a .txt file')
    }

    return fs.readFile(filePath, 'utf-8')
  }

  async write(filePath: string, content: string): Promise<void> {
    this.validatePath(filePath)

    if (!isValidTxtPath(filePath)) {
      throw new Error('Invalid file path: must be a .txt file')
    }

    await fs.writeFile(filePath, content, 'utf-8')
  }

  async create(folderPath: string, name: string): Promise<string> {
    this.validatePath(folderPath)

    const sanitizedName = sanitizeFilename(name)
    if (!sanitizedName) {
      throw new Error('Invalid filename')
    }

    const fileName = ensureTxtExtension(sanitizedName)
    const filePath = join(folderPath, fileName)

    // Validate the resulting path is still within allowed roots
    this.validatePath(filePath)

    // Check if file already exists
    try {
      await fs.access(filePath)
      throw new Error(`File already exists: ${fileName}`)
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }
    }

    await fs.writeFile(filePath, '', 'utf-8')
    return filePath
  }

  async delete(filePath: string): Promise<void> {
    this.validatePath(filePath)

    if (!isValidTxtPath(filePath)) {
      throw new Error('Invalid file path: must be a .txt file')
    }

    await fs.unlink(filePath)
  }

  async rename(oldPath: string, newName: string): Promise<string> {
    this.validatePath(oldPath)

    if (!isValidTxtPath(oldPath)) {
      throw new Error('Invalid file path: must be a .txt file')
    }

    const dir = dirname(oldPath)
    const sanitizedName = sanitizeFilename(newName)
    if (!sanitizedName) {
      throw new Error('Invalid filename')
    }

    const fileName = ensureTxtExtension(sanitizedName)
    const newPath = join(dir, fileName)

    // Validate the new path is still within allowed roots
    this.validatePath(newPath)

    await fs.rename(oldPath, newPath)
    return newPath
  }

  async exists(filePath: string): Promise<boolean> {
    this.validatePath(filePath)

    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  async list(folderPath: string): Promise<FileInfo[]> {
    this.validatePath(folderPath)

    const items = await fs.readdir(folderPath, { withFileTypes: true })
    const result: FileInfo[] = []

    for (const item of items) {
      // Skip hidden files
      if (item.name.startsWith('.')) continue

      const itemPath = join(folderPath, item.name)

      if (item.isDirectory()) {
        const children = await this.list(itemPath)
        // Only include folders that have .txt files (directly or nested)
        if (children.length > 0) {
          result.push({
            name: item.name,
            path: itemPath,
            isDirectory: true,
            children,
          })
        }
      } else if (extname(item.name).toLowerCase() === '.txt') {
        const stats = await fs.stat(itemPath)
        result.push({
          name: item.name,
          path: itemPath,
          isDirectory: false,
          size: stats.size,
          modifiedAt: stats.mtimeMs,
        })
      }
    }

    // Sort: folders first, then files, both alphabetically
    result.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1
      if (!a.isDirectory && b.isDirectory) return 1
      return a.name.localeCompare(b.name)
    })

    return result
  }
}

export const fileService = new FileService()
