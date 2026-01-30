import { useState } from 'react'
import { FolderPlus, ChevronRight, FileText, Folder, ChevronDown } from 'lucide-react'
import { useAppStore } from '../../stores/appStore'
import type { FileInfo } from '@shared/types/file'
import { clsx } from 'clsx'

export function Sidebar() {
  const { sources, fileTree, currentFile, sidebarWidth, isSidebarCollapsed, addSource, openFile } =
    useAppStore()

  const handleAddFolder = async () => {
    const path = await window.api.selectFolder()
    if (path) {
      await addSource(path)
    }
  }

  if (isSidebarCollapsed) {
    return null
  }

  return (
    <aside
      className="flex flex-col bg-bg-elevated border-r border-border-subtle overflow-hidden"
      style={{ width: sidebarWidth }}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-border-subtle">
        <h2 className="text-lg font-bold text-text-primary">Notes</h2>
        <button
          onClick={handleAddFolder}
          className="p-1.5 rounded-md text-text-secondary hover:text-accent-cyan hover:bg-bg-hover transition-colors"
          title="Add Folder"
        >
          <FolderPlus className="w-5 h-5" />
        </button>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {sources.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <Folder className="w-12 h-12 text-text-muted mb-3" />
            <p className="text-text-secondary text-sm mb-2">No folders added</p>
            <button onClick={handleAddFolder} className="btn-primary text-sm">
              <FolderPlus className="w-4 h-4" />
              Add Folder
            </button>
          </div>
        ) : (
          sources.map((source) => (
            <FolderSection
              key={source.path}
              name={source.name}
              path={source.path}
              files={fileTree.get(source.path) || []}
              currentFilePath={currentFile?.path}
              onFileSelect={openFile}
            />
          ))
        )}
      </div>
    </aside>
  )
}

interface FolderSectionProps {
  name: string
  path: string
  files: FileInfo[]
  currentFilePath?: string
  onFileSelect: (path: string) => void
}

function FolderSection({ name, files, currentFilePath, onFileSelect }: FolderSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 w-full px-3 py-1.5 text-left text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-text-muted" />
        ) : (
          <ChevronRight className="w-4 h-4 text-text-muted" />
        )}
        <Folder className="w-4 h-4 text-accent-yellow" />
        <span className="text-sm font-medium truncate">{name}</span>
      </button>

      {isExpanded && (
        <div className="ml-3">
          {files.map((file) => (
            <FileTreeItem
              key={file.path}
              file={file}
              depth={0}
              currentFilePath={currentFilePath}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface FileTreeItemProps {
  file: FileInfo
  depth: number
  currentFilePath?: string
  onFileSelect: (path: string) => void
}

function FileTreeItem({ file, depth, currentFilePath, onFileSelect }: FileTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isActive = file.path === currentFilePath

  if (file.isDirectory) {
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 w-full px-2 py-1 text-left text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-colors"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
          )}
          <Folder className="w-3.5 h-3.5 text-accent-yellow" />
          <span className="text-sm truncate">{file.name}</span>
        </button>

        {isExpanded && file.children && (
          <div>
            {file.children.map((child) => (
              <FileTreeItem
                key={child.path}
                file={child}
                depth={depth + 1}
                currentFilePath={currentFilePath}
                onFileSelect={onFileSelect}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => onFileSelect(file.path)}
      className={clsx(
        'flex items-center gap-2 w-full px-2 py-1 text-left rounded transition-colors',
        isActive
          ? 'bg-bg-active text-text-primary border-l-2 border-accent-cyan'
          : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
      )}
      style={{ paddingLeft: `${depth * 12 + 24}px` }}
    >
      <FileText className="w-3.5 h-3.5 text-accent-cyan" />
      <span className="text-sm truncate">{file.name.replace('.txt', '')}</span>
    </button>
  )
}
