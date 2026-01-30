import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from '@codemirror/view'
import { syntaxTree } from '@codemirror/language'
import { Range } from '@codemirror/state'

/**
 * Widget for rendering inline images
 */
class ImageWidget extends WidgetType {
  constructor(
    readonly src: string,
    readonly alt: string
  ) {
    super()
  }

  eq(other: ImageWidget) {
    return other.src === this.src && other.alt === this.alt
  }

  toDOM() {
    const container = document.createElement('span')
    container.className = 'cm-image-widget'

    const img = document.createElement('img')
    img.src = this.src
    img.alt = this.alt
    img.title = this.alt || this.src
    img.className = 'cm-inline-image'
    img.style.maxWidth = '100%'
    img.style.maxHeight = '300px'
    img.style.borderRadius = '4px'
    img.style.marginTop = '8px'
    img.style.marginBottom = '8px'
    img.style.display = 'block'

    img.onerror = () => {
      img.style.display = 'none'
      const errorSpan = document.createElement('span')
      errorSpan.className = 'cm-image-error'
      errorSpan.textContent = `[Image not found: ${this.alt || this.src}]`
      errorSpan.style.color = '#ff6b6b'
      errorSpan.style.fontSize = '0.875em'
      container.appendChild(errorSpan)
    }

    container.appendChild(img)
    return container
  }

  ignoreEvent() {
    return false
  }
}

/**
 * CodeMirror 6 plugin that adds visual decorations for markdown syntax.
 * This creates a "live preview" effect where markdown is styled as you type.
 */
export const markdownPreviewPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view)
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.buildDecorations(update.view)
      }
    }

    buildDecorations(view: EditorView): DecorationSet {
      const decorations: Range<Decoration>[] = []

      // Only decorate visible ranges for performance
      for (const { from, to } of view.visibleRanges) {
        syntaxTree(view.state).iterate({
          from,
          to,
          enter: (node) => {
            // Headings
            if (node.name === 'ATXHeading1') {
              decorations.push(
                Decoration.mark({ class: 'cm-heading-1' }).range(node.from, node.to)
              )
            } else if (node.name === 'ATXHeading2') {
              decorations.push(
                Decoration.mark({ class: 'cm-heading-2' }).range(node.from, node.to)
              )
            } else if (node.name === 'ATXHeading3') {
              decorations.push(
                Decoration.mark({ class: 'cm-heading-3' }).range(node.from, node.to)
              )
            } else if (node.name === 'ATXHeading4' || node.name === 'ATXHeading5' || node.name === 'ATXHeading6') {
              decorations.push(
                Decoration.mark({ class: 'cm-heading-4' }).range(node.from, node.to)
              )
            }

            // Bold/Strong
            if (node.name === 'StrongEmphasis') {
              decorations.push(
                Decoration.mark({ class: 'cm-strong' }).range(node.from, node.to)
              )
            }

            // Italic/Emphasis
            if (node.name === 'Emphasis') {
              decorations.push(
                Decoration.mark({ class: 'cm-emphasis' }).range(node.from, node.to)
              )
            }

            // Strikethrough
            if (node.name === 'Strikethrough') {
              decorations.push(
                Decoration.mark({ class: 'cm-strikethrough' }).range(node.from, node.to)
              )
            }

            // Inline code
            if (node.name === 'InlineCode') {
              decorations.push(
                Decoration.mark({ class: 'cm-code' }).range(node.from, node.to)
              )
            }

            // Code block
            if (node.name === 'FencedCode' || node.name === 'CodeBlock') {
              decorations.push(
                Decoration.mark({ class: 'cm-code-block' }).range(node.from, node.to)
              )
            }

            // Links
            if (node.name === 'Link' || node.name === 'Autolink') {
              decorations.push(
                Decoration.mark({ class: 'cm-link' }).range(node.from, node.to)
              )
            }

            // URL
            if (node.name === 'URL') {
              decorations.push(
                Decoration.mark({ class: 'cm-url' }).range(node.from, node.to)
              )
            }

            // Blockquote
            if (node.name === 'Blockquote') {
              decorations.push(
                Decoration.mark({ class: 'cm-blockquote' }).range(node.from, node.to)
              )
            }

            // Horizontal rule
            if (node.name === 'HorizontalRule') {
              decorations.push(
                Decoration.line({ class: 'cm-hr' }).range(node.from)
              )
            }

            // List markers
            if (node.name === 'ListMark') {
              decorations.push(
                Decoration.mark({ class: 'cm-list-bullet' }).range(node.from, node.to)
              )
            }

            // Images - render inline
            if (node.name === 'Image') {
              const text = view.state.doc.sliceString(node.from, node.to)
              const imageMatch = text.match(/!\[([^\]]*)\]\(([^)]+)\)/)
              if (imageMatch) {
                const [, alt, src] = imageMatch
                decorations.push(
                  Decoration.widget({
                    widget: new ImageWidget(src, alt),
                    side: 1,
                  }).range(node.to)
                )
              }
            }
          },
        })
      }

      // Also detect #tags in the text
      const text = view.state.doc.toString()
      const tagRegex = /#[a-zA-Z0-9_-]+/g
      let match
      while ((match = tagRegex.exec(text)) !== null) {
        const from = match.index
        const to = from + match[0].length

        // Only decorate if within visible range
        if (view.visibleRanges.some((r) => from >= r.from && to <= r.to)) {
          decorations.push(Decoration.mark({ class: 'cm-tag' }).range(from, to))
        }
      }

      // Sort decorations by position
      decorations.sort((a, b) => a.from - b.from || a.to - b.to)

      return Decoration.set(decorations, true)
    }
  },
  {
    decorations: (v) => v.decorations,
  }
)
