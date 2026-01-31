import { useEffect, useRef, useCallback } from 'react'
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Image,
  Hash,
} from 'lucide-react'

interface ContextMenuItem {
  id: string
  label: string
  icon: React.ReactNode
  shortcut?: string
  markdown: string
  wrap?: boolean // Whether to wrap selected text
}

const menuItems: ContextMenuItem[] = [
  {
    id: 'h1',
    label: 'Heading 1',
    icon: <Heading1 className="w-4 h-4" />,
    shortcut: 'Ctrl+1',
    markdown: '# ',
  },
  {
    id: 'h2',
    label: 'Heading 2',
    icon: <Heading2 className="w-4 h-4" />,
    shortcut: 'Ctrl+2',
    markdown: '## ',
  },
  {
    id: 'h3',
    label: 'Heading 3',
    icon: <Heading3 className="w-4 h-4" />,
    shortcut: 'Ctrl+3',
    markdown: '### ',
  },
  { id: 'divider1', label: '', icon: null, markdown: '' },
  {
    id: 'bold',
    label: 'Bold',
    icon: <Bold className="w-4 h-4" />,
    shortcut: 'Ctrl+B',
    markdown: '**',
    wrap: true,
  },
  {
    id: 'italic',
    label: 'Italic',
    icon: <Italic className="w-4 h-4" />,
    shortcut: 'Ctrl+I',
    markdown: '*',
    wrap: true,
  },
  {
    id: 'strikethrough',
    label: 'Strikethrough',
    icon: <Strikethrough className="w-4 h-4" />,
    shortcut: 'Ctrl+Shift+S',
    markdown: '~~',
    wrap: true,
  },
  {
    id: 'code',
    label: 'Inline Code',
    icon: <Code className="w-4 h-4" />,
    shortcut: 'Ctrl+`',
    markdown: '`',
    wrap: true,
  },
  { id: 'divider2', label: '', icon: null, markdown: '' },
  {
    id: 'link',
    label: 'Link',
    icon: <Link className="w-4 h-4" />,
    shortcut: 'Ctrl+K',
    markdown: '[text](url)',
  },
  {
    id: 'image',
    label: 'Image',
    icon: <Image className="w-4 h-4" />,
    markdown: '![alt](url)',
  },
  { id: 'divider3', label: '', icon: null, markdown: '' },
  {
    id: 'bullet',
    label: 'Bullet List',
    icon: <List className="w-4 h-4" />,
    markdown: '- ',
  },
  {
    id: 'numbered',
    label: 'Numbered List',
    icon: <ListOrdered className="w-4 h-4" />,
    markdown: '1. ',
  },
  {
    id: 'checkbox',
    label: 'Checkbox',
    icon: <CheckSquare className="w-4 h-4" />,
    markdown: '- [ ] ',
  },
  { id: 'divider4', label: '', icon: null, markdown: '' },
  {
    id: 'quote',
    label: 'Quote',
    icon: <Quote className="w-4 h-4" />,
    markdown: '> ',
  },
  {
    id: 'codeblock',
    label: 'Code Block',
    icon: <Code className="w-4 h-4" />,
    markdown: '```\n\n```',
  },
  {
    id: 'hr',
    label: 'Horizontal Rule',
    icon: <Minus className="w-4 h-4" />,
    markdown: '\n---\n',
  },
  {
    id: 'tag',
    label: 'Tag',
    icon: <Hash className="w-4 h-4" />,
    markdown: '#tag',
  },
]

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onInsert: (markdown: string, wrap?: boolean) => void
}

export function ContextMenu({ x, y, onClose, onInsert }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  // Adjust position to stay within viewport
  const adjustedPosition = useCallback(() => {
    const menuWidth = 220
    const menuHeight = 450
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let adjustedX = x
    let adjustedY = y

    if (x + menuWidth > viewportWidth) {
      adjustedX = viewportWidth - menuWidth - 10
    }

    if (y + menuHeight > viewportHeight) {
      adjustedY = viewportHeight - menuHeight - 10
    }

    return { x: adjustedX, y: adjustedY }
  }, [x, y])

  const pos = adjustedPosition()

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.id.startsWith('divider')) return
    onInsert(item.markdown, item.wrap)
    onClose()
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-bg-elevated border border-border-default rounded-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      style={{ left: pos.x, top: pos.y, minWidth: '200px' }}
    >
      {/* Gradient top border like wireframe modals */}
      <div
        className="h-0.5"
        style={{
          background: 'linear-gradient(90deg, #00d4ff, #aa77ff, #ff3399)',
        }}
      />

      <div className="py-1 max-h-96 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-ghost">
          Insert Markdown
        </div>

        {menuItems.map((item) => {
          if (item.id.startsWith('divider')) {
            return (
              <div key={item.id} className="my-1 mx-3 h-px bg-border-subtle" />
            )
          }

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors group"
            >
              <span className="text-text-tertiary group-hover:text-accent-cyan transition-colors">
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.shortcut && (
                <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-bg-surface border border-border-default text-text-ghost font-mono">
                  {item.shortcut}
                </kbd>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
