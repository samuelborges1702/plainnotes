import { useState } from 'react'
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
} from 'lucide-react'
import { useAppStore } from '../../stores/appStore'
import { NewNoteModal } from '../modals/NewNoteModal'
import { ConfirmModal } from '../modals/ConfirmModal'
import type { FileInfo } from '@shared/types/file'
import { clsx } from 'clsx'

export function Sidebar() {
  const {
    sources,
    fileTree,
    currentFile,
    sidebarWidth,
    isSidebarCollapsed,
    addSource,
    removeSource,
    openFile,
    createNote,
    deleteNote,
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

  const confirmDelete = async () => {
    await deleteNote(deleteModal.path)
    setDeleteModal({ isOpen: false, path: '', name: '' })
  }

  if (isSidebarCollapsed) {
    return null
  }

  return (
    <>
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
                onRemove={() => removeSource(source.path)}
                onCreateNote={() => handleCreateNote(source.path, source.name)}
                onDeleteNote={handleDeleteNote}
                isValid={source.isValid}
                error={source.error}
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
  isValid?: boolean
  error?: string
}

function FolderSection({
  name,
  files,
  currentFilePath,
  onFileSelect,
  onRemove,
  onCreateNote,
  onDeleteNote,
  isValid = true,
  error,
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
            <div className="px-3 py-2 text-xs text-text-muted italic">No .txt files found</div>
          ) : (
            files.map((file) => (
              <FileTreeItem
                key={file.path}
                file={file}
                depth={0}
                currentFilePath={currentFilePath}
                onFileSelect={onFileSelect}
                onDeleteNote={onDeleteNote}
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
}

function FileTreeItem({ file, depth, currentFilePath, onFileSelect, onDeleteNote }: FileTreeItemProps) {
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
