import { resolve, normalize, relative, isAbsolute } from 'path'

/**
 * Validates that a file path is within one of the allowed root directories.
 * Prevents path traversal attacks (e.g., ../../../etc/passwd)
 */
export function isPathWithinRoots(filePath: string, allowedRoots: string[]): boolean {
  if (allowedRoots.length === 0) {
    return false
  }

  const normalizedPath = normalize(resolve(filePath))

  return allowedRoots.some((root) => {
    const normalizedRoot = normalize(resolve(root))
    const relativePath = relative(normalizedRoot, normalizedPath)

    // If relative path is empty, the paths are the same
    if (relativePath === '') {
      return true
    }

    // If relative path starts with '..' it's outside the root
    // If relative path is absolute, it's on a different drive (Windows)
    return !relativePath.startsWith('..') && !isAbsolute(relativePath)
  })
}

/**
 * Validates and sanitizes a filename to prevent directory traversal
 */
export function sanitizeFilename(filename: string): string {
  // Remove any path separators and parent directory references
  return filename
    .replace(/[/\\]/g, '') // Remove slashes
    .replace(/\.\./g, '') // Remove parent references
    .replace(/^\.+/, '') // Remove leading dots
    .trim()
}

/**
 * Ensures a path ends with .txt extension
 */
export function ensureTxtExtension(filename: string): string {
  const sanitized = sanitizeFilename(filename)
  return sanitized.endsWith('.txt') ? sanitized : `${sanitized}.txt`
}

/**
 * Validates that a path is a valid .txt file path
 */
export function isValidTxtPath(filePath: string): boolean {
  const normalized = normalize(filePath).toLowerCase()
  return normalized.endsWith('.txt') && !normalized.includes('\0') // Null byte check
}
