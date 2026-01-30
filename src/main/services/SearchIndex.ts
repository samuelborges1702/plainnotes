import { promises as fs } from 'fs'
import { basename } from 'path'
import { SearchResult } from '@shared/types/file'
import { FolderSource } from '@shared/types/config'
import { fileService } from './FileService'

interface IndexedFile {
  path: string
  name: string
  content: string
  tags: string[]
  modifiedAt: number
}

export class SearchIndex {
  private index: Map<string, IndexedFile> = new Map()
  private isBuilding = false

  async buildIndex(sources: FolderSource[]): Promise<void> {
    if (this.isBuilding) return
    this.isBuilding = true

    try {
      this.index.clear()

      for (const source of sources) {
        await this.indexFolder(source.path)
      }
    } finally {
      this.isBuilding = false
    }
  }

  private async indexFolder(folderPath: string): Promise<void> {
    const files = await fileService.list(folderPath)

    for (const file of files) {
      if (file.isDirectory && file.children) {
        // Recursively index subfolders
        for (const child of file.children) {
          if (!child.isDirectory) {
            await this.indexFile(child.path)
          }
        }
        await this.indexFolder(file.path)
      } else if (!file.isDirectory) {
        await this.indexFile(file.path)
      }
    }
  }

  private async indexFile(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const stats = await fs.stat(filePath)

      this.index.set(filePath, {
        path: filePath,
        name: basename(filePath),
        content: content.toLowerCase(),
        tags: this.extractTags(content),
        modifiedAt: stats.mtimeMs,
      })
    } catch (error) {
      console.error(`Failed to index file: ${filePath}`, error)
    }
  }

  search(query: string): SearchResult[] {
    const results: SearchResult[] = []
    const queryLower = query.toLowerCase().trim()

    if (!queryLower) return results

    for (const [path, file] of this.index) {
      const index = file.content.indexOf(queryLower)
      if (index !== -1) {
        results.push({
          path,
          name: file.name,
          snippet: this.extractSnippet(file.content, index, queryLower.length),
          matchIndex: index,
          lineNumber: this.getLineNumber(file.content, index),
        })
      }
    }

    // Sort by relevance (exact match in name first, then by position)
    results.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(queryLower)
      const bNameMatch = b.name.toLowerCase().includes(queryLower)
      if (aNameMatch && !bNameMatch) return -1
      if (!aNameMatch && bNameMatch) return 1
      return a.matchIndex - b.matchIndex
    })

    return results.slice(0, 50) // Limit results
  }

  private extractSnippet(content: string, index: number, matchLength: number): string {
    const contextLength = 50
    const start = Math.max(0, index - contextLength)
    const end = Math.min(content.length, index + matchLength + contextLength)

    let snippet = content.slice(start, end)

    if (start > 0) snippet = '...' + snippet
    if (end < content.length) snippet = snippet + '...'

    return snippet.replace(/\n/g, ' ').trim()
  }

  private getLineNumber(content: string, index: number): number {
    return content.slice(0, index).split('\n').length
  }

  private extractTags(content: string): string[] {
    const tagRegex = /#[a-zA-Z0-9_-]+/g
    return [...new Set(content.match(tagRegex) || [])]
  }

  getAllTags(): string[] {
    const tags = new Set<string>()
    for (const file of this.index.values()) {
      file.tags.forEach((tag) => tags.add(tag))
    }
    return Array.from(tags).sort()
  }

  updateFile(filePath: string, content: string): void {
    const existing = this.index.get(filePath)
    if (existing) {
      existing.content = content.toLowerCase()
      existing.tags = this.extractTags(content)
      existing.modifiedAt = Date.now()
    }
  }

  removeFile(filePath: string): void {
    this.index.delete(filePath)
  }
}

export const searchIndex = new SearchIndex()
