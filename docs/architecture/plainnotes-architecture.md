# PlainNotes - Technical Architecture

## Document Info

| Field | Value |
|-------|-------|
| Project | PlainNotes |
| Version | 1.0 |
| Status | Draft |
| Author | Aria (Architect) |
| Created | 2026-01-30 |
| PRD Reference | docs/prd/plainnotes-prd.md |

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PlainNotes App                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Renderer Process                       │   │
│  │  ┌──────────┐  ┌──────────────┐  ┌─────────────────┐   │   │
│  │  │ Sidebar  │  │    Editor    │  │   Status Bar    │   │   │
│  │  │  Tree    │  │  CodeMirror  │  │                 │   │   │
│  │  └──────────┘  └──────────────┘  └─────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │              State Management (Zustand)           │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │ IPC                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Main Process                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │   │
│  │  │FileSystem│  │  Config  │  │  Search  │  │ Window │  │   │
│  │  │ Service  │  │  Store   │  │  Index   │  │ Manager│  │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   File System     │
                    │  ~/.plainnotes/   │
                    │   config.json     │
                    │   + User .txt     │
                    └───────────────────┘
```

### 1.2 Technology Stack Decision

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Runtime | **Electron 28+** | Cross-platform, mature, filesystem access |
| Language | **TypeScript 5.3+** | Type safety, better DX, refactoring support |
| UI Framework | **React 18** | Component model, hooks, large ecosystem |
| Editor | **CodeMirror 6** | Lightweight, live preview extensions, performant |
| Markdown | **@lezer/markdown** | CodeMirror's native markdown parser |
| Styling | **TailwindCSS 3** | Utility-first, dark mode built-in, fast |
| State | **Zustand 4** | Minimal boilerplate, TypeScript friendly |
| Build | **Vite 5 + electron-vite** | Fast HMR, optimized builds |
| Package | **electron-builder** | Cross-platform packaging |
| Config | **electron-store** | Encrypted JSON config storage |

### 1.3 Editor Decision: CodeMirror 6 vs Monaco

**Decision: CodeMirror 6**

| Criteria | CodeMirror 6 | Monaco |
|----------|--------------|--------|
| Bundle Size | ~150KB | ~10MB |
| Live Preview | Native with decorations | Split view only |
| Startup Time | Fast | Slower |
| Memory Usage | Low | High |
| Markdown Extensions | Excellent ecosystem | Limited |
| WYSIWYG-like | Supported via @codemirror/lang-markdown | Not designed for this |

CodeMirror 6 is ideal for PlainNotes because:
1. **Lightweight** - Meets NFR4 (startup < 3s)
2. **Live preview** - Native support via decorations (Typora-like experience)
3. **Modular** - Only load what's needed
4. **Performance** - Handles large files efficiently

---

## 2. Project Structure

```
plainnotes/
├── electron-builder.json5        # Electron packaging config
├── package.json
├── tsconfig.json                 # Base TypeScript config
├── tsconfig.node.json            # Node/Main process config
├── tsconfig.web.json             # Renderer process config
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # TailwindCSS config
├── postcss.config.js
│
├── src/
│   ├── main/                     # Electron Main Process
│   │   ├── index.ts              # Entry point
│   │   ├── window.ts             # Window management
│   │   ├── ipc/                  # IPC handlers
│   │   │   ├── index.ts          # Register all handlers
│   │   │   ├── file.ipc.ts       # File operations
│   │   │   ├── config.ipc.ts     # Config operations
│   │   │   └── search.ipc.ts     # Search operations
│   │   ├── services/
│   │   │   ├── FileService.ts    # File system operations
│   │   │   ├── ConfigStore.ts    # electron-store wrapper
│   │   │   ├── SearchIndex.ts    # In-memory search index
│   │   │   └── FileWatcher.ts    # chokidar file watching
│   │   └── utils/
│   │       └── paths.ts          # Path utilities
│   │
│   ├── renderer/                 # Electron Renderer Process
│   │   ├── index.html            # HTML entry
│   │   ├── main.tsx              # React entry
│   │   ├── App.tsx               # Root component
│   │   ├── styles/
│   │   │   └── globals.css       # Tailwind imports + custom
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Editor.tsx
│   │   │   │   ├── StatusBar.tsx
│   │   │   │   └── TitleBar.tsx
│   │   │   ├── sidebar/
│   │   │   │   ├── FileTree.tsx
│   │   │   │   ├── FileTreeItem.tsx
│   │   │   │   ├── RecentNotes.tsx
│   │   │   │   └── TagList.tsx
│   │   │   ├── editor/
│   │   │   │   ├── MarkdownEditor.tsx
│   │   │   │   ├── extensions/
│   │   │   │   │   ├── markdown-preview.ts
│   │   │   │   │   ├── checkbox-widget.ts
│   │   │   │   │   └── tag-highlight.ts
│   │   │   │   └── theme/
│   │   │   │       └── dark-theme.ts
│   │   │   ├── modals/
│   │   │   │   ├── SearchModal.tsx
│   │   │   │   ├── SettingsModal.tsx
│   │   │   │   ├── QuickOpen.tsx
│   │   │   │   └── ConfirmDialog.tsx
│   │   │   └── ui/
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Modal.tsx
│   │   │       └── Toast.tsx
│   │   ├── hooks/
│   │   │   ├── useIpc.ts         # IPC communication hook
│   │   │   ├── useDebounce.ts
│   │   │   ├── useKeyboard.ts    # Keyboard shortcuts
│   │   │   └── useFileTree.ts
│   │   ├── stores/
│   │   │   ├── appStore.ts       # Global app state
│   │   │   ├── editorStore.ts    # Editor state
│   │   │   └── searchStore.ts    # Search state
│   │   ├── lib/
│   │   │   ├── ipc.ts            # Type-safe IPC client
│   │   │   └── markdown.ts       # Markdown utilities
│   │   └── types/
│   │       └── index.ts          # Shared types
│   │
│   ├── shared/                   # Shared between Main & Renderer
│   │   ├── types/
│   │   │   ├── config.ts         # Config types
│   │   │   ├── file.ts           # File types
│   │   │   └── ipc.ts            # IPC channel types
│   │   └── constants/
│   │       └── channels.ts       # IPC channel names
│   │
│   └── preload/
│       └── index.ts              # Preload script (context bridge)
│
├── resources/                    # App resources
│   ├── icon.png
│   └── icon.ico
│
└── tests/
    ├── unit/
    │   ├── services/
    │   └── utils/
    └── e2e/
```

---

## 3. Component Architecture

### 3.1 Component Hierarchy

```
App
├── TitleBar (custom window controls - optional)
├── MainLayout
│   ├── Sidebar
│   │   ├── SidebarHeader (add folder button)
│   │   ├── RecentNotes
│   │   ├── TagList
│   │   └── FileTree
│   │       └── FileTreeItem (recursive)
│   ├── EditorPane
│   │   ├── EditorHeader (filename, unsaved indicator)
│   │   ├── MarkdownEditor (CodeMirror instance)
│   │   └── EditorPlaceholder (when no file open)
│   └── StatusBar
│       ├── SaveStatus
│       ├── WordCount
│       └── CursorPosition
├── SearchModal (Ctrl+Shift+F)
├── QuickOpen (Ctrl+P)
├── SettingsModal (Ctrl+,)
├── ConfirmDialog
└── ToastContainer
```

### 3.2 Key Components

#### MarkdownEditor.tsx
```typescript
interface MarkdownEditorProps {
  content: string;
  filePath: string | null;
  onChange: (content: string) => void;
  onSave: () => void;
}
```

Core responsibilities:
- Initialize CodeMirror 6 with markdown extensions
- Handle live preview rendering via decorations
- Emit onChange events (debounced for autosave)
- Handle keyboard shortcuts (Ctrl+S)

#### FileTree.tsx
```typescript
interface FileTreeProps {
  sources: FolderSource[];
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
  onFileCreate: (folderPath: string) => void;
  onFileDelete: (path: string) => void;
}
```

Core responsibilities:
- Render hierarchical file structure
- Handle expand/collapse state
- Context menu for file operations
- Filter .txt files only

---

## 4. State Management

### 4.1 Zustand Stores

#### appStore.ts
```typescript
interface AppState {
  // Folder Sources
  sources: FolderSource[];
  addSource: (path: string) => Promise<void>;
  removeSource: (path: string) => void;

  // Current File
  currentFile: FileInfo | null;
  openFile: (path: string) => Promise<void>;
  closeFile: () => void;

  // Recent Files
  recentFiles: string[];
  addToRecent: (path: string) => void;
  clearRecent: () => void;

  // Tags
  allTags: string[];
  selectedTag: string | null;
  setTagFilter: (tag: string | null) => void;

  // UI State
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
}
```

#### editorStore.ts
```typescript
interface EditorState {
  content: string;
  originalContent: string;
  isDirty: boolean;
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'error';

  setContent: (content: string) => void;
  markSaved: () => void;
  setSaveStatus: (status: SaveStatus) => void;

  // Autosave
  lastSaveTime: number | null;
}
```

#### searchStore.ts
```typescript
interface SearchState {
  query: string;
  results: SearchResult[];
  isSearching: boolean;

  setQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
}
```

---

## 5. IPC Communication

### 5.1 Channel Architecture

```typescript
// src/shared/constants/channels.ts
export const IPC_CHANNELS = {
  // File Operations
  FILE_READ: 'file:read',
  FILE_WRITE: 'file:write',
  FILE_CREATE: 'file:create',
  FILE_DELETE: 'file:delete',
  FILE_RENAME: 'file:rename',
  FILE_LIST: 'file:list',
  FILE_WATCH: 'file:watch',
  FILE_UNWATCH: 'file:unwatch',
  FILE_CHANGED: 'file:changed', // Main → Renderer

  // Folder Operations
  FOLDER_SELECT: 'folder:select',
  FOLDER_LIST_CONTENTS: 'folder:list-contents',

  // Config Operations
  CONFIG_GET: 'config:get',
  CONFIG_SET: 'config:set',

  // Search Operations
  SEARCH_INDEX_BUILD: 'search:index-build',
  SEARCH_QUERY: 'search:query',

  // Dialog Operations
  DIALOG_OPEN_FOLDER: 'dialog:open-folder',
  DIALOG_CONFIRM: 'dialog:confirm',
} as const;
```

### 5.2 Type-Safe IPC

```typescript
// src/shared/types/ipc.ts
export interface IpcApi {
  // File operations
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
  createFile: (folderPath: string, name: string) => Promise<string>;
  deleteFile: (path: string) => Promise<void>;
  listFiles: (folderPath: string) => Promise<FileInfo[]>;

  // Folder operations
  selectFolder: () => Promise<string | null>;

  // Config
  getConfig: <K extends keyof AppConfig>(key: K) => Promise<AppConfig[K]>;
  setConfig: <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => Promise<void>;

  // Search
  search: (query: string) => Promise<SearchResult[]>;

  // Events
  onFileChanged: (callback: (path: string) => void) => () => void;
}
```

### 5.3 Preload Script

```typescript
// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants/channels';

const api: IpcApi = {
  readFile: (path) => ipcRenderer.invoke(IPC_CHANNELS.FILE_READ, path),
  writeFile: (path, content) => ipcRenderer.invoke(IPC_CHANNELS.FILE_WRITE, path, content),
  // ... etc

  onFileChanged: (callback) => {
    const handler = (_: any, path: string) => callback(path);
    ipcRenderer.on(IPC_CHANNELS.FILE_CHANGED, handler);
    return () => ipcRenderer.off(IPC_CHANNELS.FILE_CHANGED, handler);
  },
};

contextBridge.exposeInMainWorld('api', api);
```

---

## 6. Data Flow

### 6.1 File Open Flow

```
User clicks file in FileTree
        │
        ▼
FileTree.onFileSelect(path)
        │
        ▼
appStore.openFile(path)
        │
        ▼
window.api.readFile(path)  ──────► IPC ──────► FileService.read(path)
        │                                              │
        ▼                                              ▼
editorStore.setContent(content) ◄── IPC ◄── fs.readFile(path, 'utf-8')
        │
        ▼
MarkdownEditor re-renders with new content
        │
        ▼
appStore.addToRecent(path)
```

### 6.2 Autosave Flow

```
User types in editor
        │
        ▼
MarkdownEditor.onChange(content)
        │
        ▼
editorStore.setContent(content)
  + setDirty(true)
        │
        ▼
useDebounce(content, 1500ms)
        │
        ▼ (after 1.5s of no changes)
        │
editorStore.setSaveStatus('saving')
        │
        ▼
window.api.writeFile(path, content)
        │
        ▼
editorStore.setSaveStatus('saved')
  + markSaved()
```

### 6.3 Search Flow

```
User opens SearchModal (Ctrl+Shift+F)
        │
        ▼
User types query
        │
        ▼
useDebounce(query, 300ms)
        │
        ▼
searchStore.search(query)
        │
        ▼
window.api.search(query) ──────► IPC ──────► SearchIndex.search(query)
        │                                           │
        │                                           ▼
        │                                    In-memory full-text search
        │                                    across all indexed .txt files
        ▼                                           │
searchStore.setResults(results) ◄───── IPC ◄───────┘
        │
        ▼
SearchModal renders results
```

---

## 7. Configuration & Persistence

### 7.1 Config Schema

```typescript
// src/shared/types/config.ts
export interface AppConfig {
  // Folder sources
  sources: FolderSource[];

  // Recent files
  recentFiles: string[];
  recentFilesLimit: number; // default: 10

  // Autosave
  autosaveEnabled: boolean; // default: true
  autosaveDelay: number;    // default: 1500 (ms)

  // UI
  sidebarWidth: number;     // default: 250

  // Window
  windowBounds: {
    x?: number;
    y?: number;
    width: number;
    height: number;
  };
}

export interface FolderSource {
  path: string;
  name: string; // folder name for display
  addedAt: number; // timestamp
}
```

### 7.2 Storage Location

```
Linux:   ~/.config/plainnotes/config.json
macOS:   ~/Library/Application Support/plainnotes/config.json
Windows: %APPDATA%/plainnotes/config.json
```

Using `electron-store` for:
- Automatic platform-specific paths
- JSON serialization
- Schema validation
- Atomic writes

---

## 8. CodeMirror 6 Extensions

### 8.1 Markdown Live Preview

```typescript
// src/renderer/components/editor/extensions/markdown-preview.ts
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';

export const markdownPreview = ViewPlugin.fromClass(class {
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = this.buildDecorations(view);
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view);
    }
  }

  buildDecorations(view: EditorView): DecorationSet {
    const decorations: Range<Decoration>[] = [];

    syntaxTree(view.state).iterate({
      enter: (node) => {
        // Handle headings
        if (node.name === 'ATXHeading1') {
          decorations.push(
            Decoration.mark({ class: 'cm-heading-1' }).range(node.from, node.to)
          );
        }
        // Handle bold
        if (node.name === 'StrongEmphasis') {
          decorations.push(
            Decoration.mark({ class: 'cm-strong' }).range(node.from, node.to)
          );
        }
        // ... handle other markdown elements
      }
    });

    return Decoration.set(decorations, true);
  }
}, {
  decorations: v => v.decorations
});
```

### 8.2 Checkbox Widget

```typescript
// src/renderer/components/editor/extensions/checkbox-widget.ts
import { WidgetType, Decoration, EditorView } from '@codemirror/view';

class CheckboxWidget extends WidgetType {
  constructor(readonly checked: boolean) { super(); }

  toDOM() {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = this.checked;
    checkbox.className = 'cm-checkbox';
    return checkbox;
  }

  eq(other: CheckboxWidget) { return other.checked === this.checked; }
}

// Replace [ ] and [x] with actual checkboxes
export const checkboxPlugin = ViewPlugin.fromClass(/* ... */);
```

### 8.3 Tag Highlighting

```typescript
// src/renderer/components/editor/extensions/tag-highlight.ts
// Regex: /#[a-zA-Z0-9_-]+/g
// Highlight tags with special styling
```

---

## 9. Search Implementation

### 9.1 In-Memory Index

```typescript
// src/main/services/SearchIndex.ts
interface IndexedFile {
  path: string;
  content: string;
  tags: string[];
  lastModified: number;
}

export class SearchIndex {
  private index: Map<string, IndexedFile> = new Map();

  async buildIndex(sources: FolderSource[]): Promise<void> {
    for (const source of sources) {
      const files = await this.scanFolder(source.path);
      for (const file of files) {
        const content = await fs.readFile(file, 'utf-8');
        this.index.set(file, {
          path: file,
          content: content.toLowerCase(),
          tags: this.extractTags(content),
          lastModified: (await fs.stat(file)).mtimeMs,
        });
      }
    }
  }

  search(query: string): SearchResult[] {
    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    for (const [path, file] of this.index) {
      const index = file.content.indexOf(queryLower);
      if (index !== -1) {
        results.push({
          path,
          snippet: this.extractSnippet(file.content, index, queryLower.length),
          matchIndex: index,
        });
      }
    }

    return results.slice(0, 50); // Limit results
  }

  private extractTags(content: string): string[] {
    const tagRegex = /#[a-zA-Z0-9_-]+/g;
    return [...new Set(content.match(tagRegex) || [])];
  }
}
```

### 9.2 Performance Considerations

- Index built on startup and cached in memory
- File watcher updates index incrementally
- Search is synchronous (fast for <1000 files)
- Results limited to 50 to avoid UI lag
- Debounced search input (300ms)

---

## 10. Dark Theme

### 10.1 Color Palette

```css
/* src/renderer/styles/globals.css */
:root {
  /* Background */
  --bg-primary: #1e1e1e;
  --bg-secondary: #252526;
  --bg-tertiary: #2d2d2d;
  --bg-hover: #3c3c3c;
  --bg-active: #094771;

  /* Text */
  --text-primary: #cccccc;
  --text-secondary: #8c8c8c;
  --text-muted: #6e6e6e;

  /* Accent */
  --accent-primary: #007acc;
  --accent-secondary: #3794ff;

  /* Borders */
  --border-primary: #3c3c3c;
  --border-secondary: #2d2d2d;

  /* Syntax Highlighting */
  --syntax-heading: #4ec9b0;
  --syntax-bold: #dcdcaa;
  --syntax-italic: #9cdcfe;
  --syntax-code: #ce9178;
  --syntax-link: #3794ff;
  --syntax-tag: #569cd6;
}
```

### 10.2 CodeMirror Theme

```typescript
// src/renderer/components/editor/theme/dark-theme.ts
import { EditorView } from '@codemirror/view';

export const darkTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
  },
  '.cm-content': {
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  '.cm-heading-1': {
    fontSize: '1.8em',
    fontWeight: 'bold',
    color: 'var(--syntax-heading)',
  },
  '.cm-heading-2': {
    fontSize: '1.5em',
    fontWeight: 'bold',
    color: 'var(--syntax-heading)',
  },
  '.cm-strong': {
    fontWeight: 'bold',
    color: 'var(--syntax-bold)',
  },
  '.cm-emphasis': {
    fontStyle: 'italic',
    color: 'var(--syntax-italic)',
  },
  '.cm-code': {
    fontFamily: '"JetBrains Mono", monospace',
    backgroundColor: 'var(--bg-tertiary)',
    padding: '2px 4px',
    borderRadius: '3px',
  },
  // ... more styles
}, { dark: true });
```

---

## 11. File Watching

### 11.1 Chokidar Setup

```typescript
// src/main/services/FileWatcher.ts
import chokidar from 'chokidar';

export class FileWatcher {
  private watchers: Map<string, chokidar.FSWatcher> = new Map();

  watch(folderPath: string, onChange: (path: string) => void): void {
    const watcher = chokidar.watch(folderPath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
    });

    watcher
      .on('change', (path) => {
        if (path.endsWith('.txt')) {
          onChange(path);
        }
      })
      .on('add', (path) => {
        if (path.endsWith('.txt')) {
          onChange(path);
        }
      })
      .on('unlink', (path) => {
        if (path.endsWith('.txt')) {
          onChange(path);
        }
      });

    this.watchers.set(folderPath, watcher);
  }

  unwatch(folderPath: string): void {
    const watcher = this.watchers.get(folderPath);
    if (watcher) {
      watcher.close();
      this.watchers.delete(folderPath);
    }
  }
}
```

---

## 12. Keyboard Shortcuts

### 12.1 Shortcut Map

| Shortcut | Action | Context |
|----------|--------|---------|
| `Ctrl+N` | New note | Global |
| `Ctrl+S` | Save | Editor |
| `Ctrl+P` | Quick open | Global |
| `Ctrl+Shift+F` | Global search | Global |
| `Ctrl+,` | Settings | Global |
| `Ctrl+W` | Close note | Editor |
| `Ctrl+Tab` | Next recent | Global |
| `Ctrl+Shift+Tab` | Previous recent | Global |
| `Esc` | Close modal | Modal |

### 12.2 Implementation

```typescript
// src/renderer/hooks/useKeyboard.ts
import { useEffect } from 'react';
import { useAppStore } from '../stores/appStore';

const shortcuts: Record<string, () => void> = {
  'ctrl+n': () => /* create note */,
  'ctrl+p': () => /* open quick open */,
  'ctrl+shift+f': () => /* open search */,
  'ctrl+,': () => /* open settings */,
};

export function useKeyboard() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = [
        e.ctrlKey && 'ctrl',
        e.shiftKey && 'shift',
        e.altKey && 'alt',
        e.key.toLowerCase(),
      ].filter(Boolean).join('+');

      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
```

---

## 13. Build & Packaging

### 13.1 Vite Config

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'src/main/index.ts',
        vite: {
          build: {
            outDir: 'dist-electron/main',
          },
        },
      },
      {
        entry: 'src/preload/index.ts',
        vite: {
          build: {
            outDir: 'dist-electron/preload',
          },
        },
      },
    ]),
    renderer(),
  ],
});
```

### 13.2 Electron Builder Config

```json5
// electron-builder.json5
{
  "appId": "com.plainnotes.app",
  "productName": "PlainNotes",
  "directories": {
    "output": "release"
  },
  "files": [
    "dist-electron",
    "dist"
  ],
  "mac": {
    "target": ["dmg", "zip"],
    "icon": "resources/icon.icns"
  },
  "win": {
    "target": ["nsis", "portable"],
    "icon": "resources/icon.ico"
  },
  "linux": {
    "target": ["AppImage", "deb"],
    "icon": "resources/icon.png",
    "category": "Utility"
  }
}
```

---

## 14. Testing Strategy

### 14.1 Unit Tests

```typescript
// tests/unit/services/SearchIndex.test.ts
describe('SearchIndex', () => {
  it('should find text in indexed files', async () => {
    const index = new SearchIndex();
    await index.addFile('/test.txt', 'Hello world');

    const results = index.search('world');
    expect(results).toHaveLength(1);
    expect(results[0].path).toBe('/test.txt');
  });

  it('should extract tags from content', () => {
    const tags = SearchIndex.extractTags('Note with #tag1 and #tag2');
    expect(tags).toEqual(['#tag1', '#tag2']);
  });
});
```

### 14.2 Component Tests

```typescript
// tests/unit/components/FileTree.test.tsx
describe('FileTree', () => {
  it('should render file tree structure', () => {
    render(<FileTree sources={mockSources} />);
    expect(screen.getByText('notes.txt')).toBeInTheDocument();
  });

  it('should call onFileSelect when clicking a file', () => {
    const onSelect = vi.fn();
    render(<FileTree sources={mockSources} onFileSelect={onSelect} />);

    fireEvent.click(screen.getByText('notes.txt'));
    expect(onSelect).toHaveBeenCalledWith('/path/to/notes.txt');
  });
});
```

---

## 15. Dependencies

### 15.1 Production Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.5.0",
    "@codemirror/state": "^6.4.0",
    "@codemirror/view": "^6.24.0",
    "@codemirror/lang-markdown": "^6.2.0",
    "@codemirror/language": "^6.10.0",
    "@lezer/markdown": "^1.2.0",
    "electron-store": "^8.1.0",
    "chokidar": "^3.5.3"
  }
}
```

### 15.2 Dev Dependencies

```json
{
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.9.0",
    "vite": "^5.0.0",
    "vite-plugin-electron": "^0.28.0",
    "vite-plugin-electron-renderer": "^0.14.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "vitest": "^1.2.0",
    "@testing-library/react": "^14.1.0",
    "eslint": "^8.56.0",
    "prettier": "^3.2.0"
  }
}
```

---

## 16. Implementation Roadmap

### Story → Architecture Mapping

| Story | Key Components | Main Process | Renderer |
|-------|---------------|--------------|----------|
| 1.1 | Project structure | Window setup | React shell |
| 1.2 | FolderSource | ConfigStore, Dialog IPC | Settings UI |
| 1.3 | FileTree | FileService.list | FileTree component |
| 1.4 | MarkdownEditor | FileService.read/write | CodeMirror setup |
| 1.5 | CM Extensions | - | markdown-preview, widgets |
| 1.6 | Create/Delete | FileService.create/delete | UI actions |
| 2.1 | Autosave | - | editorStore + debounce |
| 2.2 | RecentNotes | ConfigStore | RecentNotes component |
| 2.3 | SearchModal | SearchIndex | SearchModal component |
| 2.4 | TagList | SearchIndex.extractTags | TagList + filter |
| 2.5 | Shortcuts | - | useKeyboard hook |

---

## 17. Next Steps

1. **@dev** should implement Story 1.1 following this architecture
2. Use `electron-vite` template as starting point
3. Set up the folder structure as defined
4. Configure Tailwind with dark mode colors
5. Implement basic window with IPC skeleton

---

*Document generated by Aria (Architect) - Synkra AIOS v2.0*
