import { describe, it, expect } from 'vitest'
import {
  isPathWithinRoots,
  sanitizeFilename,
  ensureTxtExtension,
  isValidTxtPath,
} from '../../../src/main/utils/paths'

describe('isPathWithinRoots', () => {
  const allowedRoots = ['/home/user/notes', '/home/user/documents']

  it('should return true for paths within allowed roots', () => {
    expect(isPathWithinRoots('/home/user/notes/file.txt', allowedRoots)).toBe(true)
    expect(isPathWithinRoots('/home/user/notes/subfolder/file.txt', allowedRoots)).toBe(true)
    expect(isPathWithinRoots('/home/user/documents/work/notes.txt', allowedRoots)).toBe(true)
  })

  it('should return false for paths outside allowed roots', () => {
    expect(isPathWithinRoots('/etc/passwd', allowedRoots)).toBe(false)
    expect(isPathWithinRoots('/home/user/other/file.txt', allowedRoots)).toBe(false)
    expect(isPathWithinRoots('/home/user/notes/../../../etc/passwd', allowedRoots)).toBe(false)
  })

  it('should handle path traversal attempts', () => {
    expect(isPathWithinRoots('/home/user/notes/../secrets/file.txt', allowedRoots)).toBe(false)
    expect(isPathWithinRoots('/home/user/notes/../../etc/passwd', allowedRoots)).toBe(false)
  })

  it('should return false for empty roots array', () => {
    expect(isPathWithinRoots('/home/user/notes/file.txt', [])).toBe(false)
  })
})

describe('sanitizeFilename', () => {
  it('should remove path separators', () => {
    expect(sanitizeFilename('file/name.txt')).toBe('filename.txt')
    expect(sanitizeFilename('file\\name.txt')).toBe('filename.txt')
  })

  it('should remove parent directory references', () => {
    expect(sanitizeFilename('../../../etc/passwd')).toBe('etcpasswd')
    expect(sanitizeFilename('..file.txt')).toBe('file.txt')
  })

  it('should remove leading dots', () => {
    expect(sanitizeFilename('.hidden')).toBe('hidden')
    expect(sanitizeFilename('...multiple')).toBe('multiple')
  })

  it('should handle normal filenames', () => {
    expect(sanitizeFilename('my-notes.txt')).toBe('my-notes.txt')
    expect(sanitizeFilename('notes_2024')).toBe('notes_2024')
  })

  it('should trim whitespace', () => {
    expect(sanitizeFilename('  file.txt  ')).toBe('file.txt')
  })
})

describe('ensureTxtExtension', () => {
  it('should add .txt extension if missing', () => {
    expect(ensureTxtExtension('notes')).toBe('notes.txt')
    expect(ensureTxtExtension('my-file')).toBe('my-file.txt')
  })

  it('should not add .txt if already present', () => {
    expect(ensureTxtExtension('notes.txt')).toBe('notes.txt')
  })

  it('should sanitize before adding extension', () => {
    expect(ensureTxtExtension('../malicious')).toBe('malicious.txt')
  })
})

describe('isValidTxtPath', () => {
  it('should return true for valid .txt paths', () => {
    expect(isValidTxtPath('/path/to/file.txt')).toBe(true)
    expect(isValidTxtPath('/path/to/file.TXT')).toBe(true)
    expect(isValidTxtPath('C:\\Users\\file.txt')).toBe(true)
  })

  it('should return false for non-.txt paths', () => {
    expect(isValidTxtPath('/path/to/file.md')).toBe(false)
    expect(isValidTxtPath('/path/to/file.js')).toBe(false)
    expect(isValidTxtPath('/path/to/file')).toBe(false)
  })

  it('should return false for paths with null bytes', () => {
    expect(isValidTxtPath('/path/to/file.txt\0.exe')).toBe(false)
  })
})
