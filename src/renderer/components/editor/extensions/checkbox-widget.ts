import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from '@codemirror/view'
import { Range } from '@codemirror/state'

/**
 * Widget that renders a clickable checkbox for markdown task items.
 * Replaces [ ] and [x] with actual checkbox inputs.
 */
class CheckboxWidget extends WidgetType {
  constructor(readonly checked: boolean) {
    super()
  }

  eq(other: CheckboxWidget) {
    return other.checked === this.checked
  }

  toDOM() {
    const wrap = document.createElement('span')
    wrap.setAttribute('aria-hidden', 'true')
    wrap.className = 'cm-checkbox-widget'

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = this.checked
    checkbox.className = 'cm-task-checkbox'
    checkbox.setAttribute('tabindex', '-1')

    wrap.appendChild(checkbox)
    return wrap
  }

  ignoreEvent() {
    return false
  }
}

/**
 * CodeMirror 6 plugin that adds interactive checkboxes for task list items.
 * Matches patterns like:
 * - [ ] unchecked task
 * - [x] checked task
 * - [X] checked task (uppercase)
 */
export const checkboxPlugin = ViewPlugin.fromClass(
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

      // Match task list items: - [ ] or - [x] or - [X] or * [ ] etc.
      const taskRegex = /^(\s*[-*+]\s*)\[([ xX])\]/gm
      const text = view.state.doc.toString()

      let match
      while ((match = taskRegex.exec(text)) !== null) {
        const checkboxStart = match.index + match[1].length
        const checkboxEnd = checkboxStart + 3 // [x] is 3 chars

        // Only decorate if within visible range
        if (
          view.visibleRanges.some(
            (r) => checkboxStart >= r.from && checkboxEnd <= r.to
          )
        ) {
          const isChecked = match[2].toLowerCase() === 'x'

          // Replace the [ ] or [x] with a widget
          decorations.push(
            Decoration.replace({
              widget: new CheckboxWidget(isChecked),
            }).range(checkboxStart, checkboxEnd)
          )
        }
      }

      // Sort by position
      decorations.sort((a, b) => a.from - b.from)

      return Decoration.set(decorations, true)
    }
  },
  {
    decorations: (v) => v.decorations,

    eventHandlers: {
      mousedown: (e, view) => {
        const target = e.target as HTMLElement
        if (
          target.nodeName === 'INPUT' &&
          target.classList.contains('cm-task-checkbox')
        ) {
          e.preventDefault()

          // Find the position in the document
          const pos = view.posAtDOM(target)

          // Get the line at this position
          const line = view.state.doc.lineAt(pos)
          const lineText = line.text

          // Find the checkbox in this line
          const checkboxMatch = lineText.match(/^(\s*[-*+]\s*)\[([ xX])\]/)
          if (checkboxMatch) {
            const checkboxOffset = checkboxMatch[1].length + 1 // Position of space/x inside brackets
            const checkboxPos = line.from + checkboxOffset

            // Toggle the checkbox
            const currentChar = view.state.doc.sliceString(
              checkboxPos,
              checkboxPos + 1
            )
            const newChar = currentChar === ' ' ? 'x' : ' '

            view.dispatch({
              changes: {
                from: checkboxPos,
                to: checkboxPos + 1,
                insert: newChar,
              },
            })
          }

          return true
        }
        return false
      },
    },
  }
)
