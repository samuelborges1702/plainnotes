import { useEffect, useRef, useCallback } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, placeholder, drawSelection } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { markdownPreviewPlugin } from './extensions/markdown-preview'
import { checkboxPlugin } from './extensions/checkbox-widget'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  onSave: () => void
}

// Dark theme colors matching our design system
const darkTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#141414',
      color: '#e5e5e5',
      height: '100%',
    },
    '.cm-content': {
      fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
      fontSize: '14px',
      lineHeight: '1.7',
      padding: '24px',
      caretColor: '#00d4ff',
    },
    '.cm-cursor': {
      borderLeftColor: '#00d4ff',
      borderLeftWidth: '2px',
    },
    '.cm-selectionBackground': {
      backgroundColor: '#00d4ff30 !important',
    },
    '&.cm-focused .cm-selectionBackground': {
      backgroundColor: '#00d4ff30 !important',
    },
    '.cm-gutters': {
      backgroundColor: '#141414',
      border: 'none',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#1f1f1f',
    },
    '.cm-activeLine': {
      backgroundColor: '#1a1a1a',
    },
    '.cm-scroller': {
      overflow: 'auto',
    },
    // Markdown styling
    '.cm-heading-1': {
      fontSize: '1.875em',
      fontWeight: 'bold',
      color: '#00d4ff',
      lineHeight: '1.4',
    },
    '.cm-heading-2': {
      fontSize: '1.5em',
      fontWeight: 'bold',
      color: '#00d4ff',
      lineHeight: '1.4',
    },
    '.cm-heading-3': {
      fontSize: '1.25em',
      fontWeight: 'bold',
      color: '#00d4ff',
      lineHeight: '1.4',
    },
    '.cm-heading-4': {
      fontSize: '1.125em',
      fontWeight: 'bold',
      color: '#00d4ff',
    },
    '.cm-strong': {
      fontWeight: 'bold',
      color: '#ffcc00',
    },
    '.cm-emphasis': {
      fontStyle: 'italic',
      color: '#aa77ff',
    },
    '.cm-strikethrough': {
      textDecoration: 'line-through',
      color: '#666666',
    },
    '.cm-code': {
      fontFamily: '"JetBrains Mono", monospace',
      backgroundColor: '#1f1f1f',
      padding: '2px 6px',
      borderRadius: '4px',
      color: '#ff7744',
    },
    '.cm-code-block': {
      backgroundColor: '#1a1a1a',
      borderLeft: '3px solid #00d4ff',
      paddingLeft: '12px',
    },
    '.cm-link': {
      color: '#00d4ff',
      textDecoration: 'underline',
    },
    '.cm-url': {
      color: '#666666',
    },
    '.cm-hr': {
      display: 'block',
      borderTop: '1px solid #333333',
      margin: '16px 0',
    },
    '.cm-list-bullet': {
      color: '#00ff88',
    },
    '.cm-task-marker': {
      color: '#ff3399',
    },
    '.cm-tag': {
      color: '#aa77ff',
      backgroundColor: '#aa77ff15',
      padding: '1px 4px',
      borderRadius: '3px',
    },
    '.cm-blockquote': {
      borderLeft: '3px solid #ff3399',
      paddingLeft: '12px',
      color: '#a3a3a3',
      fontStyle: 'italic',
    },
    // Checkbox widget styling
    '.cm-checkbox-widget': {
      display: 'inline-flex',
      alignItems: 'center',
      verticalAlign: 'middle',
    },
    '.cm-task-checkbox': {
      width: '16px',
      height: '16px',
      margin: '0 4px 0 0',
      cursor: 'pointer',
      accentColor: '#00ff88',
      backgroundColor: '#1f1f1f',
      border: '1px solid #404040',
      borderRadius: '3px',
    },
    '.cm-task-checkbox:checked': {
      backgroundColor: '#00ff88',
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

  // Use refs for callbacks to avoid re-creating the editor on every prop change
  const onChangeRef = useRef(onChange)
  const onSaveRef = useRef(onSave)
  const initialContentRef = useRef(content)

  // Keep refs updated
  onChangeRef.current = onChange
  onSaveRef.current = onSave

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

    const saveKeymap = keymap.of([
      {
        key: 'Mod-s',
        run: () => {
          onSaveRef.current()
          return true
        },
      },
    ])

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString())
      }
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

  return <div ref={editorRef} className="h-full w-full overflow-hidden" />
}
