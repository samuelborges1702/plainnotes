import { useState, useCallback } from 'react'
import {
  FolderPlus,
  ChevronRight,
  FileText,
  Folder,
  ChevronDown,
  X,
  AlertTriangle,
  FilePlus,
  Trash2,
  Clock,
  Tag,
  Filter,
  Edit3,
} from 'lucide-react'
import { useAppStore } from '../../stores/appStore'
import { NewNoteModal } from '../modals/NewNoteModal'
import { ConfirmModal } from '../modals/ConfirmModal'
import { RenameModal } from '../modals/RenameModal'
import type { FileInfo } from '@shared/types/file'
import { clsx } from 'clsx'

export function Sidebar() {
  const {
    sources,
    currentFile,
    sidebarWidth,
    isSidebarCollapsed,
    recentFiles,
    allTags,
    activeTagFilter,
    addSource,
    removeSource,
    openFile,
    createNote,
    renameNote,
    deleteNote,
    clearRecent,
    setTagFilter,
    getFilteredFiles,
  } = useAppStore()

  // New note modal state
  const [newNoteModal, setNewNoteModal] = useState<{
    isOpen: boolean
    folderPath: string
    folderName: string
  }>({ isOpen: false, folderPath: '', folderName: '' })

  // Delete confirmation state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    path: string
    name: string
  }>({ isOpen: false, path: '', name: '' })

  // Rename modal state
  const [renameModal, setRenameModal] = useState<{
    isOpen: boolean
    path: string
    name: string
  }>({ isOpen: false, path: '', name: '' })

  // Drag and drop state
  const [isDragOver, setIsDragOver] = useState(false)

  const handleAddFolder = async () => {
    const path = await window.api.selectFolder()
    if (path) {
      await addSource(path)
    }
  }

  const handleCreateNote = (folderPath: string, folderName: string) => {
    setNewNoteModal({ isOpen: true, folderPath, folderName })
  }

  const handleDeleteNote = (path: string, name: string) => {
    setDeleteModal({ isOpen: true, path, name })
  }

  const handleRenameNote = (path: string, name: string) => {
    setRenameModal({ isOpen: true, path, name })
  }

  const confirmDelete = async () => {
    await deleteNote(deleteModal.path)
    setDeleteModal({ isOpen: false, path: '', name: '' })
  }

  const confirmRename = async (newName: string) => {
    await renameNote(renameModal.path, newName)
    setRenameModal({ isOpen: false, path: '', name: '' })
  }

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      const items = e.dataTransfer.items
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry?.()
          if (entry?.isDirectory) {
            // For directories, we need to get the path from the file
            const file = item.getAsFile()
            if (file && 'path' in file) {
              await addSource((file as File & { path: string }).path)
            }
          }
        }
      }
    },
    [addSource]
  )

  if (isSidebarCollapsed) {
    return null
  }

  return (
    <>
      <aside
        className={clsx(
          'flex flex-col bg-bg-elevated border-r border-border-subtle overflow-hidden transition-colors',
          isDragOver && 'bg-accent-cyan/10 border-accent-cyan'
        )}
        style={{ width: sidebarWidth }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-border-subtle">
          <h1 className="text-lg font-bold">
            <span className="text-text-primary">Plain</span>
            <span className="text-gradient-cyan">Notes</span>
          </h1>
          <div
            className="flex items-center gap-1"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            <button
              onClick={handleAddFolder}
              className="sidebar-action-btn p-1.5 rounded-md text-text-muted hover:text-accent-cyan hover:border hover:border-accent-cyan transition-colors"
              title="Add Folder"
              type="button"
              style={{ WebkitAppRegion: 'no-drag', pointerEvents: 'auto' } as React.CSSProperties}
            >
              <FolderPlus className="w-5 h-5 pointer-events-none" />
            </button>
          </div>
        </div>

        {/* Tags Section */}
        {allTags.size > 0 && (
          <TagsSection
            tags={allTags}
            activeTagFilter={activeTagFilter}
            onTagSelect={setTagFilter}
          />
        )}

        {/* Recent Notes Section */}
        {recentFiles.length > 0 && !activeTagFilter && (
          <RecentNotesSection
            recentFiles={recentFiles}
            currentFilePath={currentFile?.path}
            onFileSelect={openFile}
            onClear={clearRecent}
          />
        )}

        {/* Active Filter Indicator */}
        {activeTagFilter && (
          <div className="flex items-center gap-2 px-3 py-2 bg-accent-purple/10 border-b border-border-subtle">
            <Filter className="w-4 h-4 text-accent-purple" />
            <span className="text-sm text-accent-purple">
              Filtering by <span className="font-medium">#{activeTagFilter}</span>
            </span>
            <button
              onClick={() => setTagFilter(null)}
              className="ml-auto p-1 rounded hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
              title="Clear filter"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* File Tree */}
        <div className="flex-1 overflow-y-auto py-2">
          {sources.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <Folder className="w-12 h-12 text-text-muted mb-3" />
              <p className="text-text-secondary text-sm mb-2">No folders added</p>
              <p className="text-text-muted text-xs mb-3">Drag & drop a folder here or</p>
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
                files={getFilteredFiles(source.path)}
                currentFilePath={currentFile?.path}
                onFileSelect={openFile}
                onRemove={() => removeSource(source.path)}
                onCreateNote={() => handleCreateNote(source.path, source.name)}
                onDeleteNote={handleDeleteNote}
                onRenameNote={handleRenameNote}
                isValid={source.isValid}
                error={source.error}
                isFiltered={!!activeTagFilter}
              />
            ))
          )}
        </div>
      </aside>

      {/* New Note Modal */}
      <NewNoteModal
        isOpen={newNoteModal.isOpen}
        folderName={newNoteModal.folderName}
        onClose={() => setNewNoteModal({ isOpen: false, folderPath: '', folderName: '' })}
        onCreate={(name) => createNote(newNoteModal.folderPath, name)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Note"
        message={`Are you sure you want to delete "${deleteModal.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, path: '', name: '' })}
      />

      {/* Rename Modal */}
      <RenameModal
        isOpen={renameModal.isOpen}
        currentName={renameModal.name}
        onClose={() => setRenameModal({ isOpen: false, path: '', name: '' })}
        onRename={confirmRename}
      />
    </>
  )
}

interface FolderSectionProps {
  name: string
  path: string
  files: FileInfo[]
  currentFilePath?: string
  onFileSelect: (path: string) => void
  onRemove: () => void
  onCreateNote: () => void
  onDeleteNote: (path: string, name: string) => void
  onRenameNote: (path: string, name: string) => void
  isValid?: boolean
  error?: string
  isFiltered?: boolean
}

function FolderSection({
  name,
  files,
  currentFilePath,
  onFileSelect,
  onRemove,
  onCreateNote,
  onDeleteNote,
  onRenameNote,
  isValid = true,
  error,
  isFiltered = false,
}: FolderSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (showRemoveConfirm) {
      onRemove()
      setShowRemoveConfirm(false)
    } else {
      setShowRemoveConfirm(true)
      // Auto-hide confirm after 3 seconds
      setTimeout(() => setShowRemoveConfirm(false), 3000)
    }
  }

  return (
    <div className="mb-2 group/folder">
      <div
        className={clsx(
          'flex items-center gap-1 w-full px-3 py-1.5 text-left transition-colors',
          isValid
            ? 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            : 'text-status-error bg-status-error/10'
        )}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 flex-1 min-w-0"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
          )}
          {isValid ? (
            <Folder className="w-4 h-4 text-accent-yellow flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-status-error flex-shrink-0" />
          )}
          <span className="text-sm font-medium truncate">{name}</span>
        </button>

        {/* New note button */}
        {isValid && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCreateNote()
            }}
            className="p-1 rounded transition-all flex-shrink-0 opacity-0 group-hover/folder:opacity-100 text-text-muted hover:text-accent-green hover:bg-bg-hover"
            title="New note"
          >
            <FilePlus className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Remove button */}
        <button
          onClick={handleRemove}
          className={clsx(
            'p-1 rounded transition-all flex-shrink-0',
            showRemoveConfirm
              ? 'bg-status-error text-white'
              : 'opacity-0 group-hover/folder:opacity-100 text-text-muted hover:text-status-error hover:bg-bg-hover'
          )}
          title={showRemoveConfirm ? 'Click again to confirm' : 'Remove folder'}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Error message */}
      {!isValid && error && (
        <div className="px-3 py-1 text-xs text-status-error bg-status-error/5 border-l-2 border-status-error ml-3">
          {error}
        </div>
      )}

      {isExpanded && isValid && (
        <div className="ml-3">
          {files.length === 0 ? (
            <div className="px-3 py-2 text-xs text-text-muted italic">
              {isFiltered ? 'No matching notes' : 'No .txt files found'}
            </div>
          ) : (
            files.map((file) => (
              <FileTreeItem
                key={file.path}
                file={file}
                depth={0}
                currentFilePath={currentFilePath}
                onFileSelect={onFileSelect}
                onDeleteNote={onDeleteNote}
                onRenameNote={onRenameNote}
              />
            ))
          )}
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
  onDeleteNote: (path: string, name: string) => void
  onRenameNote: (path: string, name: string) => void
}

function FileTreeItem({ file, depth, currentFilePath, onFileSelect, onDeleteNote, onRenameNote }: FileTreeItemProps) {
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
                onDeleteNote={onDeleteNote}
                onRenameNote={onRenameNote}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const fileName = file.name.replace('.txt', '')

  return (
    <div
      className={clsx(
        'group/file flex items-center w-full rounded transition-colors',
        isActive
          ? 'bg-bg-active border-l-2 border-accent-cyan'
          : 'hover:bg-bg-hover'
      )}
      style={{ paddingLeft: `${depth * 12 + 24}px` }}
    >
      <button
        onClick={() => onFileSelect(file.path)}
        className={clsx(
          'flex items-center gap-2 flex-1 min-w-0 px-2 py-1 text-left',
          isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
        )}
      >
        <FileText className="w-3.5 h-3.5 text-accent-cyan flex-shrink-0" />
        <span className="text-sm truncate">{fileName}</span>
      </button>

      {/* Rename button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRenameNote(file.path, file.name)
        }}
        className="p-1 rounded transition-all flex-shrink-0 opacity-0 group-hover/file:opacity-100 text-text-muted hover:text-accent-cyan hover:bg-bg-hover"
        title="Rename note"
      >
        <Edit3 className="w-3 h-3" />
      </button>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDeleteNote(file.path, fileName)
        }}
        className="p-1 mr-1 rounded transition-all flex-shrink-0 opacity-0 group-hover/file:opacity-100 text-text-muted hover:text-status-error hover:bg-bg-hover"
        title="Delete note"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  )
}

interface RecentNotesSectionProps {
  recentFiles: string[]
  currentFilePath?: string
  onFileSelect: (path: string) => void
  onClear: () => void
}

function RecentNotesSection({
  recentFiles,
  currentFilePath,
  onFileSelect,
  onClear,
}: RecentNotesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (showClearConfirm) {
      onClear()
      setShowClearConfirm(false)
    } else {
      setShowClearConfirm(true)
      // Auto-hide confirm after 3 seconds
      setTimeout(() => setShowClearConfirm(false), 3000)
    }
  }

  // Extract file name from path
  const getFileName = (path: string) => {
    const name = path.split(/[/\\]/).pop() || 'Untitled'
    return name.replace('.txt', '')
  }

  return (
    <div className="border-b border-border-subtle">
      <div className="flex items-center gap-1 w-full px-3 py-1.5 text-left text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors group/recent">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 flex-1 min-w-0"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
          )}
          <Clock className="w-4 h-4 text-accent-purple flex-shrink-0" />
          <span className="text-sm font-medium">Recent</span>
          <span className="text-xs text-text-muted ml-1">({recentFiles.length})</span>
        </button>

        {/* Clear button */}
        <button
          onClick={handleClear}
          className={clsx(
            'p-1 rounded transition-all flex-shrink-0',
            showClearConfirm
              ? 'bg-status-error text-white'
              : 'opacity-0 group-hover/recent:opacity-100 text-text-muted hover:text-status-error hover:bg-bg-hover'
          )}
          title={showClearConfirm ? 'Click again to confirm' : 'Clear recent notes'}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {isExpanded && (
        <div className="pb-2">
          {recentFiles.map((path) => {
            const fileName = getFileName(path)
            const isActive = path === currentFilePath

            return (
              <button
                key={path}
                onClick={() => onFileSelect(path)}
                className={clsx(
                  'flex items-center gap-2 w-full px-3 py-1 text-left transition-colors',
                  isActive
                    ? 'bg-bg-active text-text-primary border-l-2 border-accent-cyan'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                )}
                title={path}
              >
                <FileText className="w-3.5 h-3.5 text-accent-cyan flex-shrink-0 ml-5" />
                <span className="text-sm truncate">{fileName}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface TagsSectionProps {
  tags: Map<string, number>
  activeTagFilter: string | null
  onTagSelect: (tag: string | null) => void
}

function TagsSection({ tags, activeTagFilter, onTagSelect }: TagsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Sort tags by count (descending), then alphabetically
  const sortedTags = Array.from(tags.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1]
    return a[0].localeCompare(b[0])
  })

  return (
    <div className="border-b border-border-subtle">
      <div className="flex items-center gap-1 w-full px-3 py-1.5 text-left text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors group/tags">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 flex-1 min-w-0"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
          )}
          <Tag className="w-4 h-4 text-accent-purple flex-shrink-0" />
          <span className="text-sm font-medium">Tags</span>
          <span className="text-xs text-text-muted ml-1">({tags.size})</span>
        </button>
      </div>

      {isExpanded && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {sortedTags.map(([tag, count]) => {
            const isActive = activeTagFilter === tag

            return (
              <button
                key={tag}
                onClick={() => onTagSelect(isActive ? null : tag)}
                className={clsx(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-all',
                  isActive
                    ? 'bg-accent-purple text-white'
                    : 'bg-accent-purple/10 text-accent-purple border border-accent-purple/30 hover:bg-accent-purple/20 hover:border-accent-purple/50'
                )}
                title={`${count} note${count !== 1 ? 's' : ''} with #${tag}`}
              >
                <span>#{tag}</span>
                <span
                  className={clsx(
                    'text-[10px] px-1 rounded-full',
                    isActive ? 'bg-white/20' : 'bg-accent-purple/20'
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
