import { useEffect, useRef, useCallback, useState } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, placeholder, drawSelection } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { markdownPreviewPlugin } from './extensions/markdown-preview'
import { checkboxPlugin } from './extensions/checkbox-widget'
import { ContextMenu } from './ContextMenu'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  onSave: () => void
}

interface ContextMenuState {
  visible: boolean
  x: number
  y: number
}

// Dark theme colors matching wireframe design system
const darkTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#141414',
      color: '#f0f0f0',
      height: '100%',
    },
    '.cm-content': {
      fontFamily: '"Inter", -apple-system, sans-serif',
      fontSize: '16px',
      lineHeight: '1.8',
      padding: '48px 64px',
      maxWidth: '800px',
      margin: '0 auto',
      caretColor: '#00d4ff',
    },
    '.cm-cursor': {
      borderLeftColor: '#00d4ff',
      borderLeftWidth: '2px',
    },
    '.cm-selectionBackground': {
      backgroundColor: 'rgba(0, 212, 255, 0.25) !important',
    },
    '&.cm-focused .cm-selectionBackground': {
      backgroundColor: 'rgba(0, 212, 255, 0.25) !important',
    },
    '.cm-gutters': {
      backgroundColor: '#141414',
      border: 'none',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#1f1f1f',
    },
    '.cm-activeLine': {
      backgroundColor: 'transparent',
    },
    '.cm-scroller': {
      overflow: 'auto',
    },
    // Markdown styling - Matching wireframe
    '.cm-heading-1': {
      fontSize: '32px',
      fontWeight: '700',
      color: '#f0f0f0',
      lineHeight: '1.2',
      display: 'block',
      paddingBottom: '12px',
      marginBottom: '24px',
      borderBottom: '2px solid #00d4ff',
    },
    '.cm-heading-2': {
      fontSize: '22px',
      fontWeight: '600',
      color: '#f0f0f0',
      lineHeight: '1.4',
      display: 'block',
      paddingLeft: '12px',
      marginTop: '40px',
      marginBottom: '16px',
      borderLeft: '3px solid #aa77ff',
    },
    '.cm-heading-3': {
      fontSize: '18px',
      fontWeight: '600',
      color: '#f0f0f0',
      lineHeight: '1.4',
      display: 'block',
      paddingBottom: '6px',
      marginTop: '32px',
      marginBottom: '12px',
      borderBottom: '1px solid #333333',
    },
    '.cm-heading-4': {
      fontSize: '16px',
      fontWeight: '600',
      color: '#f0f0f0',
    },
    '.cm-strong': {
      fontWeight: '600',
      color: '#f0f0f0',
    },
    '.cm-emphasis': {
      fontStyle: 'italic',
      color: '#a0a0a0',
    },
    '.cm-strikethrough': {
      textDecoration: 'line-through',
      color: '#606060',
    },
    '.cm-code': {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '14px',
      backgroundColor: '#222222',
      padding: '3px 7px',
      borderRadius: '4px',
      border: '1px solid #ff7744',
      color: '#f0f0f0',
    },
    '.cm-code-block': {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '14px',
      backgroundColor: '#222222',
      borderLeft: '3px solid #00ff88',
      paddingLeft: '20px',
      paddingTop: '20px',
      paddingBottom: '20px',
      marginTop: '24px',
      marginBottom: '24px',
      borderRadius: '6px',
      display: 'block',
      color: '#a0a0a0',
      lineHeight: '1.6',
    },
    '.cm-link': {
      color: '#f0f0f0',
      textDecoration: 'none',
      borderBottom: '1px solid #00d4ff',
      cursor: 'pointer',
      transition: 'border-color 150ms ease',
    },
    '.cm-link:hover': {
      borderBottomWidth: '2px',
    },
    '.cm-url': {
      color: '#606060',
    },
    '.cm-hr': {
      display: 'block',
      height: '1px',
      background: 'linear-gradient(90deg, transparent, #00d4ff 20%, #aa77ff 50%, #ff3399 80%, transparent)',
      margin: '40px 0',
      border: 'none',
    },
    '.cm-list-bullet': {
      color: '#ff3399',
      fontWeight: 'bold',
    },
    '.cm-task-marker': {
      color: '#ff3399',
    },
    '.cm-tag': {
      color: '#a0a0a0',
      backgroundColor: 'transparent',
      padding: '2px 10px',
      border: '1px solid #aa77ff',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '500',
      transition: 'all 150ms ease',
    },
    '.cm-tag:hover': {
      color: '#f0f0f0',
      boxShadow: '0 0 12px rgba(170, 119, 255, 0.4)',
    },
    '.cm-blockquote': {
      borderLeft: '3px solid #ff3399',
      paddingLeft: '12px',
      color: '#a0a0a0',
      fontStyle: 'italic',
      marginTop: '16px',
      marginBottom: '16px',
    },
    // Checkbox widget styling - wireframe style
    '.cm-checkbox-widget': {
      display: 'inline-flex',
      alignItems: 'center',
      verticalAlign: 'middle',
    },
    '.cm-task-checkbox': {
      width: '18px',
      height: '18px',
      margin: '0 12px 0 0',
      cursor: 'pointer',
      appearance: 'none',
      backgroundColor: 'transparent',
      border: '2px solid #606060',
      borderRadius: '4px',
      transition: 'all 150ms ease',
    },
    '.cm-task-checkbox:hover': {
      borderColor: '#00d4ff',
    },
    '.cm-task-checkbox:checked': {
      borderColor: '#00ff88',
      backgroundColor: 'transparent',
    },
    // Paragraph styling
    '.cm-line': {
      color: '#a0a0a0',
      marginBottom: '18px',
    },
  },
  { dark: true }
)

// Syntax highlighting
const markdownHighlighting = HighlightStyle.define([
  { tag: tags.heading1, class: 'cm-heading-1' },
  { tag: tags.heading2, class: 'cm-heading-2' },
  { tag: tags.heading3, class: 'cm-heading-3' },
  { tag: tags.heading4, class: 'cm-heading-4' },
  { tag: tags.strong, class: 'cm-strong' },
  { tag: tags.emphasis, class: 'cm-emphasis' },
  { tag: tags.strikethrough, class: 'cm-strikethrough' },
  { tag: tags.monospace, class: 'cm-code' },
  { tag: tags.link, class: 'cm-link' },
  { tag: tags.url, class: 'cm-url' },
  { tag: tags.quote, class: 'cm-blockquote' },
  { tag: tags.list, class: 'cm-list-bullet' },
])

export function MarkdownEditor({ content, onChange, onSave }: MarkdownEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
  })

  // Use refs for callbacks to avoid re-creating the editor on every prop change
  const onChangeRef = useRef(onChange)
  const onSaveRef = useRef(onSave)
  const initialContentRef = useRef(content)

  // Keep refs updated
  onChangeRef.current = onChange
  onSaveRef.current = onSave

  // Handle context menu insert
  const handleContextMenuInsert = useCallback((markdown: string, wrap?: boolean) => {
    const view = viewRef.current
    if (!view) return

    const { from, to } = view.state.selection.main
    const selectedText = view.state.doc.sliceString(from, to)

    let insertText: string
    let cursorOffset: number

    if (wrap && selectedText) {
      // Wrap selected text with markdown syntax
      insertText = `${markdown}${selectedText}${markdown}`
      cursorOffset = insertText.length
    } else if (wrap) {
      // Insert markers with cursor in middle
      insertText = `${markdown}${markdown}`
      cursorOffset = markdown.length
    } else {
      // Just insert the markdown
      insertText = markdown
      cursorOffset = insertText.length
    }

    view.dispatch({
      changes: { from, to, insert: insertText },
      selection: { anchor: from + cursorOffset },
    })

    view.focus()
  }, [])

  // Handle content updates from outside
  const updateContent = useCallback((newContent: string) => {
    const view = viewRef.current
    if (!view) return

    const currentContent = view.state.doc.toString()
    if (currentContent !== newContent) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentContent.length,
          insert: newContent,
        },
      })
    }
  }, [])

  // Initialize editor
  useEffect(() => {
    if (!editorRef.current) return

    // Helper to wrap selection or insert at cursor
    const wrapSelection = (view: EditorView, marker: string) => {
      const { from, to } = view.state.selection.main
      const selectedText = view.state.doc.sliceString(from, to)

      if (selectedText) {
        view.dispatch({
          changes: { from, to, insert: `${marker}${selectedText}${marker}` },
          selection: { anchor: from + marker.length + selectedText.length + marker.length },
        })
      } else {
        view.dispatch({
          changes: { from, insert: `${marker}${marker}` },
          selection: { anchor: from + marker.length },
        })
      }
      return true
    }

    const insertAtLineStart = (view: EditorView, prefix: string) => {
      const { from } = view.state.selection.main
      const line = view.state.doc.lineAt(from)
      view.dispatch({
        changes: { from: line.from, insert: prefix },
        selection: { anchor: line.from + prefix.length },
      })
      return true
    }

    const saveKeymap = keymap.of([
      {
        key: 'Mod-s',
        run: () => {
          onSaveRef.current()
          return true
        },
      },
      {
        key: 'Mod-b',
        run: (view) => wrapSelection(view, '**'),
      },
      {
        key: 'Mod-i',
        run: (view) => wrapSelection(view, '*'),
      },
      {
        key: 'Mod-Shift-s',
        run: (view) => wrapSelection(view, '~~'),
      },
      {
        key: 'Mod-`',
        run: (view) => wrapSelection(view, '`'),
      },
      {
        key: 'Mod-1',
        run: (view) => insertAtLineStart(view, '# '),
      },
      {
        key: 'Mod-2',
        run: (view) => insertAtLineStart(view, '## '),
      },
      {
        key: 'Mod-3',
        run: (view) => insertAtLineStart(view, '### '),
      },
      {
        key: 'Mod-k',
        run: (view) => {
          const { from, to } = view.state.selection.main
          const selectedText = view.state.doc.sliceString(from, to)
          const linkText = selectedText || 'link text'
          const insert = `[${linkText}](url)`
          view.dispatch({
            changes: { from, to, insert },
            selection: { anchor: from + linkText.length + 3, head: from + linkText.length + 6 },
          })
          return true
        },
      },
    ])

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString())
      }
    })

    // Handle clicks on links and context menu
    const clickHandler = EditorView.domEventHandlers({
      contextmenu: (event) => {
        event.preventDefault()
        setContextMenu({
          visible: true,
          x: event.clientX,
          y: event.clientY,
        })
        return true
      },
      click: (event, view) => {
        const target = event.target as HTMLElement
        // Check if clicked element or parent has cm-link class
        const linkElement = target.closest('.cm-link')
        if (linkElement) {
          const text = view.state.doc.toString()
          const pos = view.posAtDOM(target)
          // Find the URL in the surrounding text
          const lineStart = text.lastIndexOf('\n', pos) + 1
          const lineEnd = text.indexOf('\n', pos)
          const line = text.slice(lineStart, lineEnd === -1 ? undefined : lineEnd)

          // Match markdown links [text](url) or raw URLs
          const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/) ||
                           line.match(/(https?:\/\/[^\s)]+)/)
          if (linkMatch) {
            const url = linkMatch[2] || linkMatch[1]
            if (url.startsWith('http://') || url.startsWith('https://')) {
              event.preventDefault()
              window.open(url, '_blank')
              return true
            }
          }
        }
        return false
      },
    })

    const state = EditorState.create({
      doc: initialContentRef.current,
      extensions: [
        history(),
        drawSelection(),
        EditorView.lineWrapping,
        keymap.of([...defaultKeymap, ...historyKeymap]),
        saveKeymap,
        markdown({ base: markdownLanguage }),
        syntaxHighlighting(markdownHighlighting),
        darkTheme,
        markdownPreviewPlugin,
        checkboxPlugin,
        placeholder('Start typing your note...'),
        updateListener,
        clickHandler,
      ],
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, []) // Only run once on mount

  // Update content when it changes externally
  useEffect(() => {
    updateContent(content)
  }, [content, updateContent])

  // Listen for scroll-to-line events from global search
  useEffect(() => {
    const handleScrollToLine = (e: CustomEvent<{ lineNumber: number }>) => {
      const view = viewRef.current
      if (!view) return

      const { lineNumber } = e.detail
      const doc = view.state.doc

      // Ensure line number is within bounds
      const safeLineNumber = Math.min(Math.max(1, lineNumber), doc.lines)
      const line = doc.line(safeLineNumber)

      // Scroll to line and place cursor at start of line
      view.dispatch({
        selection: { anchor: line.from },
        scrollIntoView: true,
        effects: EditorView.scrollIntoView(line.from, { y: 'center' }),
      })

      // Focus the editor
      view.focus()
    }

    window.addEventListener('scroll-to-line', handleScrollToLine as EventListener)
    return () => {
      window.removeEventListener('scroll-to-line', handleScrollToLine as EventListener)
    }
  }, [])

  return (
    <>
      <div ref={editorRef} className="h-full w-full overflow-hidden" />
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu({ visible: false, x: 0, y: 0 })}
          onInsert={handleContextMenuInsert}
        />
      )}
    </>
  )
}
