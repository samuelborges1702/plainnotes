# PlainNotes - Product Requirements Document (PRD)

## Document Info

| Field | Value |
|-------|-------|
| Project | PlainNotes |
| Version | 1.3 |
| Status | MVP Complete |
| Author | Orion (AIOS Master) |
| Created | 2026-01-30 |

---

## 1. Goals and Background Context

### 1.1 Goals

- Centralizar notas em arquivos .txt espalhados em múltiplas pastas
- Permitir edição com visualização live preview estilo Typora
- Manter arquivos .txt como formato base (sem lock-in)
- Oferecer formatação visual usando sintaxe Markdown
- Acesso rápido a notas recentes com autosave automático
- Busca global e organização por tags

### 1.2 Background Context

O usuário mantém diversas notas em arquivos .txt espalhados em pastas nos documentos. A necessidade é de uma ferramenta pessoal que centralize essas notas, permitindo navegação, edição e visualização formatada sem abandonar o formato .txt - mantendo compatibilidade universal e simplicidade.

A solução proposta é um editor desktop leve que lê/escreve arquivos .txt puros, mas renderiza a sintaxe Markdown visualmente durante a edição (live preview), similar ao Typora. Isso permite que os arquivos continuem legíveis em qualquer editor de texto, enquanto o PlainNotes oferece uma experiência visual aprimorada.

### 1.3 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-01-30 | 1.0 | Initial PRD creation | Orion |
| 2026-01-30 | 1.1 | Epic 1 QA Review - PASS (6/6 stories complete) | Quinn (QA) |
| 2026-01-30 | 1.2 | Epic 2 QA Review - PASS (4/4 stories complete) | Quinn (QA) |
| 2026-01-30 | 1.3 | MVP Polish - Missing features implemented | Dex (Dev) |

---

## 2. Requirements

### 2.1 Functional Requirements

- **FR1:** O sistema deve permitir adicionar múltiplas pastas como "sources" de notas
- **FR2:** O sistema deve listar todas as notas .txt das pastas configuradas em uma sidebar navegável
- **FR3:** O sistema deve abrir e exibir o conteúdo de arquivos .txt selecionados
- **FR4:** O sistema deve permitir edição do conteúdo com live preview (WYSIWYG-like)
- **FR5:** O sistema deve renderizar sintaxe Markdown visualmente durante a edição:
  - Títulos (# ## ###)
  - Negrito (**texto** ou __texto__)
  - Itálico (*texto* ou _texto_)
  - Listas (- item)
  - Checkboxes ([ ] e [x])
  - Código inline (`código`)
  - Blocos de código (```)
  - Linhas divisórias (---)
  - Links e imagens (sintaxe markdown padrão)
- **FR6:** O sistema deve salvar automaticamente alterações (autosave) com debounce
- **FR7:** O sistema deve manter um menu de "Recentes" com as últimas notas acessadas
- **FR8:** O sistema deve permitir busca global por texto em todas as notas
- **FR9:** O sistema deve reconhecer e indexar tags no formato #tag
- **FR10:** O sistema deve permitir filtrar notas por tags
- **FR11:** O sistema deve permitir criar novas notas .txt
- **FR12:** O sistema deve permitir renomear notas existentes
- **FR13:** O sistema deve permitir deletar notas (com confirmação)
- **FR14:** O sistema deve persistir configurações (pastas, recentes, preferências)

### 2.2 Non-Functional Requirements

- **NFR1:** A aplicação deve ser desenvolvida com Electron + TypeScript
- **NFR2:** A aplicação deve funcionar em Windows, Linux e macOS
- **NFR3:** O tema padrão deve ser Dark Mode
- **NFR4:** O tempo de startup deve ser inferior a 3 segundos
- **NFR5:** O autosave deve ter debounce de 1-2 segundos para evitar escritas excessivas
- **NFR6:** A busca deve retornar resultados em menos de 500ms para até 1000 notas
- **NFR7:** A aplicação não deve usar banco de dados - apenas arquivos .txt e config JSON
- **NFR8:** O código deve seguir padrões de clean code e ser facilmente extensível

---

## 3. User Interface Design Goals

### 3.1 Overall UX Vision

Interface minimalista e focada no conteúdo, inspirada em editores como Typora e Obsidian. O usuário deve sentir que está escrevendo em um editor limpo, não em uma IDE complexa. A transição entre escrita e visualização deve ser imperceptível (live preview).

### 3.2 Key Interaction Paradigms

- **Live Preview:** O texto é renderizado enquanto digita, sem modo de edição separado
- **Keyboard-first:** Atalhos para ações comuns (novo, salvar, busca, navegação)
- **Drag & Drop:** Arrastar pastas para adicionar como sources
- **Quick Access:** Ctrl+P ou similar para busca rápida de notas

### 3.3 Core Screens and Views

1. **Main Editor View**
   - Sidebar esquerda com árvore de pastas/notas
   - Área central de edição com live preview
   - Barra de status inferior (contagem de palavras, status de save)

2. **Settings/Preferences**
   - Gerenciar pastas de notas
   - Configurações de autosave
   - Preferências de tema (futuro)

3. **Search Modal**
   - Busca global com preview de resultados
   - Filtro por tags
   - Navegação por teclado

4. **Recent Notes Menu**
   - Lista dropdown ou sidebar section
   - Acesso rápido às últimas notas editadas

### 3.4 Accessibility

- Nenhum requisito específico de WCAG para ferramenta pessoal
- Foco em usabilidade básica e contraste adequado no dark mode

### 3.5 Branding

- Visual limpo e minimalista
- Paleta dark mode: fundo escuro (#1e1e1e ou similar), texto claro
- Sem logotipo elaborado - foco na funcionalidade

### 3.6 Target Device and Platforms

- **Desktop Only:** Windows, Linux, macOS
- Electron como runtime cross-platform

---

## 4. Technical Assumptions

### 4.1 Repository Structure

- **Monorepo** - projeto único contendo frontend Electron

### 4.2 Service Architecture

- **Desktop Monolith** - aplicação Electron standalone
- Sem backend/servidor - tudo local
- Electron Main Process para operações de arquivo
- Electron Renderer Process para UI

### 4.3 Stack Técnica

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| Runtime | Electron | Cross-platform desktop, acesso a filesystem |
| Linguagem | TypeScript | Type safety, melhor DX |
| UI Framework | React | Componentização, ecossistema rico |
| Editor | Monaco Editor ou CodeMirror 6 | Live preview, syntax highlighting |
| Markdown Parser | marked ou remark | Parse de markdown para renderização |
| Styling | TailwindCSS ou CSS Modules | Dark mode, responsividade |
| State | Zustand ou Context API | Simplicidade, sem boilerplate |
| Build | Vite + electron-builder | Build rápido, empacotamento cross-platform |

### 4.4 Testing Requirements

- **Unit Tests:** Jest para lógica de negócio (parsing, busca, tags)
- **Component Tests:** React Testing Library para componentes UI
- **E2E:** Playwright ou Spectron para fluxos críticos (opcional para MVP)

### 4.5 Additional Technical Assumptions

- Arquivos de configuração em JSON no diretório do usuário (~/.plainnotes ou AppData)
- Índice de busca em memória (reconstruído no startup) - sem SQLite para simplicidade
- Watch de filesystem para detectar mudanças externas nas notas
- Encoding UTF-8 para todos os arquivos .txt

---

## 5. Epic List

### Epic 1: Foundation & Core Editor
Estabelecer a estrutura do projeto Electron, navegação de arquivos e editor básico com live preview.

### Epic 2: Notes Management & Productivity
Implementar funcionalidades de produtividade: autosave, recentes, busca global e sistema de tags.

---

## 6. Epic Details

### Epic 1: Foundation & Core Editor

**Goal:** Criar a base da aplicação com navegação de pastas, listagem de notas e editor funcional com live preview markdown. Ao final deste epic, o usuário pode abrir pastas, navegar entre notas .txt e editá-las com formatação visual.

#### Story 1.1: Project Setup & Electron Shell

**As a** developer,
**I want** a working Electron + React + TypeScript project structure,
**so that** I have a solid foundation to build the application.

**Acceptance Criteria:**
1. Projeto Electron inicializado com React e TypeScript
2. Vite configurado para build do renderer
3. Estrutura de pastas organizada (src/main, src/renderer, src/shared)
4. Hot reload funcionando em desenvolvimento
5. Build de produção gerando executável
6. ESLint e Prettier configurados
7. Package.json com scripts: dev, build, lint

---

#### Story 1.2: Folder Source Management

**As a** user,
**I want** to add folders as note sources,
**so that** I can access my existing .txt notes.

**Acceptance Criteria:**
1. Botão "Add Folder" abre diálogo nativo de seleção de pasta
2. Pastas adicionadas são persistidas em config local
3. Lista de pastas configuradas exibida em Settings ou sidebar
4. Opção de remover pasta da lista de sources
5. Pastas inválidas/inexistentes mostram indicador de erro

---

#### Story 1.3: File Tree Sidebar

**As a** user,
**I want** to see a tree view of my notes in a sidebar,
**so that** I can navigate between notes easily.

**Acceptance Criteria:**
1. Sidebar esquerda exibe árvore de pastas/arquivos
2. Apenas arquivos .txt são listados
3. Pastas podem ser expandidas/colapsadas
4. Clique em arquivo abre no editor
5. Arquivo atualmente aberto é destacado visualmente
6. Ícones diferenciando pastas e arquivos

---

#### Story 1.4: Basic Text Editor

**As a** user,
**I want** to view and edit the content of a .txt file,
**so that** I can modify my notes.

**Acceptance Criteria:**
1. Área de edição central exibe conteúdo do arquivo selecionado
2. Texto é editável
3. Alterações são refletidas imediatamente na UI
4. Ctrl+S salva manualmente o arquivo
5. Indicador visual de "unsaved changes"
6. Encoding UTF-8 mantido ao salvar

---

#### Story 1.5: Markdown Live Preview Rendering

**As a** user,
**I want** markdown syntax to be rendered visually while I type,
**so that** I can see formatted text without switching modes.

**Acceptance Criteria:**
1. Títulos (#, ##, ###) renderizados com tamanhos apropriados
2. **Negrito** e *itálico* renderizados corretamente
3. Listas (- item) renderizadas como bullet points
4. Checkboxes ([ ] e [x]) renderizados e clicáveis
5. `Código inline` com estilo monoespaçado
6. Blocos de código (```) com syntax highlighting básico
7. Linhas divisórias (---) renderizadas
8. Preview atualiza em tempo real durante digitação

---

#### Story 1.6: Create and Delete Notes

**As a** user,
**I want** to create new notes and delete existing ones,
**so that** I can manage my note collection.

**Acceptance Criteria:**
1. Botão/atalho "New Note" cria arquivo .txt na pasta selecionada
2. Prompt para nome do arquivo (sem extensão, adicionada automaticamente)
3. Nota criada é aberta automaticamente no editor
4. Opção de deletar nota (via context menu ou botão)
5. Confirmação antes de deletar
6. Nota deletada é removida do filesystem e da UI

---

### Epic 1 - QA Review Summary

**Review Date:** 2026-01-30
**Reviewer:** Quinn (QA Agent)
**Gate Decision:** ✅ **PASS**

| Story | Status | Notes |
|-------|--------|-------|
| 1.1 Project Setup | ✅ PASS | Electron + React + TS + Vite + ESLint configured |
| 1.2 Folder Source Management | ✅ PASS | Add/remove folders with persistence |
| 1.3 File Tree Sidebar | ✅ PASS | Recursive tree with expand/collapse |
| 1.4 Basic Text Editor | ✅ PASS | CodeMirror 6 with Ctrl+S save |
| 1.5 Markdown Live Preview | ✅ PASS | Headers, bold, italic, code, checkboxes, lists |
| 1.6 Create/Delete Notes | ✅ PASS | Modal for create, confirmation for delete |

**Quality Metrics:**
- Lint: 0 warnings
- TypeCheck: No errors
- Tests: 15 passed
- Build: Success

**Files Implemented:**
- `src/main/` - Electron main process (IPC, FileService, ConfigStore, SearchIndex)
- `src/renderer/` - React UI (Sidebar, Editor, MarkdownEditor, modals)
- `src/shared/` - Types and constants
- `src/preload/` - Context bridge API

---

### Epic 2: Notes Management & Productivity

**Goal:** Adicionar funcionalidades que melhoram a produtividade: autosave, menu de recentes, busca global e sistema de tags. Ao final, o usuário tem uma experiência completa de gerenciamento de notas.

#### Story 2.1: Autosave Implementation

**As a** user,
**I want** my notes to be saved automatically,
**so that** I don't lose changes.

**Acceptance Criteria:**
1. Alterações são salvas automaticamente após 1.5s de inatividade (debounce)
2. Indicador visual mostra status: "Saving...", "Saved"
3. Autosave não dispara se não há alterações
4. Configuração para habilitar/desabilitar autosave (opcional)
5. Erro de salvamento exibe notificação

---

#### Story 2.2: Recent Notes Menu

**As a** user,
**I want** quick access to recently opened notes,
**so that** I can resume work quickly.

**Acceptance Criteria:**
1. Seção "Recentes" na sidebar ou menu dropdown
2. Lista as últimas 10 notas acessadas (configurável)
3. Clique abre a nota no editor
4. Lista persiste entre sessões
5. Notas deletadas são removidas dos recentes
6. Opção de limpar recentes

---

#### Story 2.3: Global Search

**As a** user,
**I want** to search text across all my notes,
**so that** I can find information quickly.

**Acceptance Criteria:**
1. Atalho Ctrl+Shift+F abre modal de busca global
2. Campo de texto para query de busca
3. Resultados mostram: nome do arquivo, trecho com match highlighted
4. Busca é case-insensitive por padrão
5. Clique no resultado abre a nota e posiciona no match
6. Resultados atualizam enquanto digita (com debounce)
7. Performance aceitável para até 1000 notas

---

#### Story 2.4: Tag System

**As a** user,
**I want** to categorize notes with #tags,
**so that** I can organize and filter my notes.

**Acceptance Criteria:**
1. Tags no formato #tag são reconhecidas no conteúdo
2. Tags são renderizadas com estilo visual diferenciado
3. Painel ou dropdown lista todas as tags existentes
4. Clique em tag filtra a sidebar para mostrar apenas notas com essa tag
5. Opção de limpar filtro e ver todas as notas
6. Tags são extraídas automaticamente (sem cadastro manual)

---

#### Story 2.5: Keyboard Shortcuts & Polish

**As a** user,
**I want** keyboard shortcuts for common actions,
**so that** I can work efficiently.

**Acceptance Criteria:**
1. Ctrl+N: Nova nota
2. Ctrl+S: Salvar (manual)
3. Ctrl+P: Quick open (busca por nome de nota)
4. Ctrl+Shift+F: Busca global
5. Ctrl+,: Abrir settings
6. Esc: Fechar modais
7. Barra de status mostra contagem de palavras/caracteres
8. Tooltips indicam atalhos em botões

---

### Epic 2 - QA Review Summary

**Review Date:** 2026-01-30
**Reviewer:** Quinn (QA Agent)
**Gate Decision:** ✅ **PASS**

| Story | Status | Notes |
|-------|--------|-------|
| 2.1 Autosave | ⏭️ SKIP | Implemented as part of Story 1.4 (debounced save on change) |
| 2.2 Recent Notes Menu | ✅ PASS | RecentNotesSection with persistence and clear option |
| 2.3 Global Search | ✅ PASS | SearchModal with Ctrl+Shift+F, highlighted matches |
| 2.4 Tag System | ✅ PASS | Tag extraction, TagsSection with filter support |
| 2.5 Keyboard Shortcuts | ✅ PASS | All shortcuts implemented + StatusBar with hints |

**Quality Metrics:**
- Lint: 0 warnings
- TypeCheck: No errors
- Tests: 15 passed
- Build: Success

**Files Implemented:**
- `src/renderer/hooks/useKeyboardShortcuts.ts` - Global keyboard shortcuts hook
- `src/renderer/components/modals/SearchModal.tsx` - Global search modal
- `src/renderer/components/modals/QuickOpenModal.tsx` - Quick file open (Ctrl+P)
- `src/renderer/components/modals/SettingsModal.tsx` - Settings with shortcuts reference
- `src/renderer/components/layout/Sidebar.tsx` - Added RecentNotesSection, TagsSection
- `src/renderer/components/layout/StatusBar.tsx` - Word/char count, shortcut hints
- `src/renderer/stores/appStore.ts` - Tag extraction and filtering logic

**Key Features:**
- Recent notes with session persistence
- Global search with highlighted snippets
- Tag-based filtering (#tag syntax)
- Keyboard-first workflow
- Status bar with real-time stats

---

### MVP Polish - Missing Features

**Date:** 2026-01-30
**Implementer:** Dex (Dev Agent)

| Feature | Status | Notes |
|---------|--------|-------|
| FR12: Rename Notes | ✅ DONE | RenameModal + rename button in file tree |
| FR5: Image Rendering | ✅ DONE | Inline image display with error handling |
| Clickable Links | ✅ DONE | Opens external URLs in default browser |
| Drag & Drop Folders | ✅ DONE | Drop folders directly on sidebar to add |

**Files Implemented:**
- `src/renderer/components/modals/RenameModal.tsx` - Rename note modal
- `src/renderer/components/editor/extensions/markdown-preview.ts` - Image widget
- `src/renderer/components/editor/MarkdownEditor.tsx` - Link click handler
- `src/renderer/components/layout/Sidebar.tsx` - Drag/drop + rename UI
- `src/renderer/stores/appStore.ts` - renameNote action

**MVP Status:** ✅ All 14 Functional Requirements implemented

---

## 7. Out of Scope (Future Enhancements)

- Light mode / theme toggle
- Sync com cloud (Dropbox, Google Drive)
- Mobile version
- Plugins/extensões
- Exportação para PDF/HTML
- Colaboração em tempo real
- Suporte a outros formatos (md, rtf)
- Backlinks / graph view (estilo Obsidian)

---

## 8. Next Steps

### 8.1 Architect Prompt

```
@architect Preciso que você crie a arquitetura técnica para o PlainNotes
baseado no PRD em docs/prd/plainnotes-prd.md.

Foco em:
- Estrutura de pastas do projeto Electron + React + TypeScript
- Definição de componentes principais
- Fluxo de dados entre Main e Renderer process
- Escolha final entre Monaco Editor vs CodeMirror 6 para live preview
- Estratégia de persistência de configurações
```

### 8.2 Dev Prompt (após arquitetura)

```
@dev Implemente a Story 1.1 (Project Setup) do PlainNotes
seguindo a arquitetura em docs/architecture/plainnotes-architecture.md
```

---

*Document generated by Orion (AIOS Master) - Synkra AIOS v2.0*
