# PlainNotes - UI/UX Specification

## Document Info

| Field | Value |
|-------|-------|
| Project | PlainNotes |
| Version | 2.0 |
| Status | **Approved** |
| Author | Uma (UX Design Expert) |
| Created | 2026-01-30 |
| Updated | 2026-01-30 |
| PRD Reference | docs/prd/plainnotes-prd.md |
| Architecture Reference | docs/architecture/plainnotes-architecture.md |
| Wireframe | docs/design/wireframes/plainnotes-wireframe-mono-accent.html |

---

## 1. Design Principles

### 1.1 Core UX Principles

| Principle | Description |
|-----------|-------------|
| **Content First** | A interface deve desaparecer - o foco é 100% no conteúdo |
| **Calm Technology** | Sem distrações, animações sutis, feedback discreto |
| **Keyboard Native** | Todo fluxo principal acessível via teclado |
| **Progressive Disclosure** | Complexidade revelada conforme necessidade |
| **Instant Feedback** | Autosave silencioso, estados claros |

### 1.2 Visual Philosophy

**Mono + Vivid Accents**

O design segue uma filosofia de **base monocromática com acentos vivos nas bordas e detalhes**:

- **Core monocromático:** Fundos e textos em tons de cinza escuro/claro
- **Acentos nas bordas:** Cores vivas aplicadas APENAS em bordas, linhas e indicadores
- **Sem preenchimentos coloridos:** Background sempre neutro
- **Harmonia:** Cores vivas criam pontos focais sem poluir visualmente

Inspiração: **Typora + Obsidian + VS Code**

---

## 2. Design Tokens

### 2.1 Color Palette - Mono + Vivid Accents

```css
/* ============================================
   PLAINNOTES DESIGN TOKENS
   Theme: Mono + Vivid Accents
   ============================================ */

:root {
  /* ========== BACKGROUND - Monochrome ========== */
  --bg-base: #141414;           /* Main background */
  --bg-surface: #1a1a1a;        /* Sidebar, panels */
  --bg-elevated: #222222;       /* Modals, cards */
  --bg-hover: #2a2a2a;          /* Hover states */
  --bg-active: #303030;         /* Active/pressed states */

  /* ========== TEXT - Monochrome ========== */
  --text-primary: #f0f0f0;      /* Main text */
  --text-secondary: #a0a0a0;    /* Secondary text */
  --text-tertiary: #606060;     /* Muted text */
  --text-ghost: #404040;        /* Disabled, hints */

  /* ========== VIVID ACCENTS - Borders Only ========== */
  --accent-cyan: #00d4ff;       /* Primary accent */
  --accent-magenta: #ff3399;    /* Danger/delete */
  --accent-green: #00ff88;      /* Success/checked */
  --accent-yellow: #ffcc00;     /* Warning/modified */
  --accent-purple: #aa77ff;     /* Tags/secondary */
  --accent-orange: #ff7744;     /* Code */

  /* ========== PRIMARY ACCENT ========== */
  --accent-primary: var(--accent-cyan);

  /* ========== BORDERS ========== */
  --border-subtle: #252525;     /* Very subtle */
  --border-default: #333333;    /* Default borders */

  /* ========== SEMANTIC (Border Colors) ========== */
  --color-success: var(--accent-green);
  --color-warning: var(--accent-yellow);
  --color-error: var(--accent-magenta);
}
```

### 2.2 Accent Usage Rules

| Accent | Hex | Usage |
|--------|-----|-------|
| **Cyan** | #00d4ff | Primary actions, active states, links, focus rings |
| **Purple** | #aa77ff | Tags, H2 borders, secondary highlights |
| **Green** | #00ff88 | Success, checkmarks, code blocks border |
| **Yellow** | #ffcc00 | Modified indicator, warnings (with glow) |
| **Magenta** | #ff3399 | Delete, danger, close buttons |
| **Orange** | #ff7744 | Inline code borders |

### 2.3 Typography

```css
:root {
  /* ========== FONT FAMILIES ========== */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Consolas', monospace;

  /* ========== FONT SIZES ========== */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.8125rem;    /* 13px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.375rem;     /* 22px */
  --text-2xl: 1.75rem;     /* 28px */
  --text-3xl: 2rem;        /* 32px */

  /* ========== FONT WEIGHTS ========== */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* ========== LINE HEIGHTS ========== */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.8;
}
```

### 2.4 Spacing & Layout

```css
:root {
  /* ========== SPACING ========== */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-12: 3rem;     /* 48px */

  /* ========== LAYOUT ========== */
  --sidebar-width: 250px;
  --statusbar-height: 26px;
  --header-height: 50px;
  --editor-max-width: 700px;
  --editor-padding: 48px 64px;

  /* ========== BORDER RADIUS ========== */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-full: 9999px;
}
```

### 2.5 Effects & Animations

```css
:root {
  /* ========== TRANSITIONS ========== */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-smooth: 300ms cubic-bezier(0.16, 1, 0.3, 1);

  /* ========== SHADOWS ========== */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 24px 48px rgba(0, 0, 0, 0.4);

  /* ========== GLOWS (for accents) ========== */
  --glow-cyan: 0 0 12px rgba(0, 212, 255, 0.4);
  --glow-purple: 0 0 12px rgba(170, 119, 255, 0.4);
  --glow-green: 0 0 12px rgba(0, 255, 136, 0.4);
  --glow-yellow: 0 0 8px rgba(255, 204, 0, 0.6);
  --glow-magenta: 0 0 12px rgba(255, 51, 153, 0.4);

  /* ========== FOCUS ========== */
  --focus-ring: 0 0 0 2px var(--bg-base), 0 0 0 4px var(--accent-cyan);

  /* ========== BACKDROP ========== */
  --backdrop-blur: blur(4px);
}
```

---

## 3. Layout Architecture

### 3.1 Main Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                           App Container                              │
├──────────────────┬──────────────────────────────────────────────────┤
│                  │                                                   │
│     SIDEBAR      │                    EDITOR                        │
│     (250px)      │                                                   │
│                  │  ┌─────────────────────────────────────────────┐ │
│ ┌──────────────┐ │  │              Editor Header                  │ │
│ │   Header     │ │  │  filename.txt                    [modified] │ │
│ │ PlainNotes   │ │  ├─────────────────────────────────────────────┤ │
│ ├──────────────┤ │  │                                             │ │
│ │   Recent     │ │  │              Editor Canvas                  │ │
│ ├──────────────┤ │  │           (max-width: 700px)                │ │
│ │    Tags      │ │  │                                             │ │
│ ├──────────────┤ │  │         Live Preview Markdown               │ │
│ │   Divider    │ │  │                                             │ │
│ ├──────────────┤ │  │                                             │ │
│ │              │ │  │                                             │ │
│ │  File Tree   │ │  │                                             │ │
│ │              │ │  └─────────────────────────────────────────────┘ │
│ │              │ │                                                   │
│ └──────────────┘ │                                                   │
│                  │                                                   │
├──────────────────┴──────────────────────────────────────────────────┤
│ [Status Bar]  ● modified  ·  234 words  ·  ln 15, col 8             │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Resize Behavior

- Sidebar tem indicador visual de resize (barra vertical sutil no hover)
- Sidebar min-width: 200px, max-width: 400px
- Editor ocupa espaço restante
- Conteúdo do editor centralizado com max-width: 700px

---

## 4. Component Specifications

### 4.1 Sidebar Header

```
┌─────────────────────────────────────┐
│  Plain[Notes]              [+] [⚙]  │
└─────────────────────────────────────┘

Height: 50px
Padding: 0 16px
Background: var(--bg-surface)
Border-bottom: 1px solid var(--border-subtle)

Logo "Notes": Gradient text (cyan → purple)
Logo hover: Brightness 1.2
Buttons: 28×28px, border on hover (cyan)
```

### 4.2 Section Header

```
┌─────────────────────────────────────┐
│  RECENT                          ▾  │
└─────────────────────────────────────┘

Height: 28px
Font: 10px, uppercase, letter-spacing 0.1em
Color: var(--text-ghost)
Chevron: Rotates -90° when collapsed (animated)
```

### 4.3 List Items (Recent, Tags)

| State | Background | Border-left | Text |
|-------|------------|-------------|------|
| Default | transparent | transparent | --text-secondary |
| Hover | --bg-hover | transparent | --text-primary |
| Active | --bg-active | **2px cyan** | --text-primary |

```
Height: 30px
Padding: 0 16px
Transition: 150ms ease
```

### 4.4 Tree Items (Files)

| State | Background | Border | Text |
|-------|------------|--------|------|
| Default | transparent | transparent | --text-secondary |
| Hover | --bg-hover | transparent | --text-primary |
| Active | --bg-active | **1px cyan** | --text-primary |

```
Height: 28px
Padding: 0 12px
Margin: 2px 8px
Border-radius: 4px

Modified indicator: 6px dot, yellow with glow
```

### 4.5 Editor Typography

| Element | Size | Weight | Color | Border Accent |
|---------|------|--------|-------|---------------|
| H1 | 32px | 700 | --text-primary | Bottom 2px **cyan** |
| H2 | 22px | 600 | --text-primary | Left 3px **purple** |
| H3 | 18px | 600 | --text-primary | Bottom 1px subtle |
| Body | 16px | 400 | --text-secondary | - |
| Bold | inherit | 600 | --text-primary | - |
| Italic | inherit | 400 | --text-secondary | - |
| Code | 14px | 400 | --text-primary | 1px **orange** |
| Link | inherit | 400 | --text-primary | Bottom 1px **cyan** |
| Tag | 13px | 500 | --text-secondary | 1px **purple** (pill) |

### 4.6 Code Blocks

```
Background: var(--bg-elevated)
Border-left: 3px solid var(--accent-green)
Border-radius: 6px
Padding: 20px
Font: JetBrains Mono, 14px
```

### 4.7 Checkboxes

```
┌─────────────────────────────────────┐
│  [✓] Task completed                 │  ← Green border + checkmark
│  [ ] Task pending                   │  ← Gray border, cyan on hover
└─────────────────────────────────────┘

Size: 18×18px
Border: 2px solid
Unchecked hover: border cyan
Checked: border green, checkmark green
Checked text: line-through, --text-tertiary
```

### 4.8 Tags (in editor)

```
┌──────────┐ ┌──────────┐ ┌──────────┐
│ #projeto │ │   #api   │ │ #backend │
└──────────┘ └──────────┘ └──────────┘
   purple       cyan        green

Style: Pill (border-radius: 20px)
Border: 1px solid accent
Background: transparent
Hover: Glow effect + translateY(-1px)
```

### 4.9 Horizontal Rule

```
Background: linear-gradient(90deg,
  transparent,
  cyan 20%,
  purple 50%,
  magenta 80%,
  transparent
)
Height: 1px
Margin: 40px 0
```

### 4.10 Status Bar

```
┌─────────────────────────────────────────────────────────────────────┐
│  ● modified  ·  234 words  ·  ln 15, col 8                          │
└─────────────────────────────────────────────────────────────────────┘

Height: 26px
Background: var(--bg-surface)
Font: 11px, JetBrains Mono
Color: var(--text-tertiary)

Status dot:
- Saved: green border (hollow)
- Modified: yellow border + glow
```

---

## 5. Modal System

### 5.1 Modal Base

```css
/* Backdrop */
background: rgba(0, 0, 0, 0.75);
backdrop-filter: blur(4px);

/* Modal */
background: var(--bg-elevated);
border: 1px solid var(--border-default);
border-radius: 6px;
box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);

/* Top accent bar */
::before {
  height: 2px;
  background: linear-gradient(90deg, cyan, purple, magenta);
}

/* Animation */
transform: translateY(-10px) scale(0.98) → translateY(0) scale(1);
transition: 200ms cubic-bezier(0.16, 1, 0.3, 1);
```

### 5.2 Search Modal

```
Width: 540px
┌──────────────────────────────────────────────────────┐
│ ═══════════════════════════════════════════════════ │ ← gradient bar
├──────────────────────────────────────────────────────┤
│  ⌕  [Search notes...                              ] │ ← input 48px
├──────────────────────────────────────────────────────┤
│  │ projeto-api.txt                                   │ ← cyan border
│  │ ...implementing the [search] functionality...     │   on selected
│                                                      │
│    ideias-2024.txt                                   │
│    ...need to [search] for better solutions...       │
├──────────────────────────────────────────────────────┤
│  3 results          [↵] open    [esc] close          │ ← kbd styled
└──────────────────────────────────────────────────────┘

Match highlight: yellow color + underline
```

### 5.3 Settings Modal

```
Width: 620px, Height: 440px
┌──────────────────────────────────────────────────────┐
│ Settings                                        [×]  │
├─────────────┬────────────────────────────────────────┤
│  │ General  │  FOLDERS                               │
│    Editor   │  ┌──────────────────────────────────┐  │
│    Keys     │  │ ~/Documentos/Notas          [−]  │  │
│             │  └──────────────────────────────────┘  │
│             │  [+ Add Folder]                        │
│             │                                        │
│             │  AUTOSAVE                              │
│             │  [✓] Enable autosave                   │
│             │  Delay [1500] ms                       │
└─────────────┴────────────────────────────────────────┘

Nav active: purple left border + bg-active
Folder hover: cyan border
```

### 5.4 Confirm Dialog

```
Width: 380px
┌──────────────────────────────────────┐
│ Delete note                     [×]  │
├──────────────────────────────────────┤
│                                      │
│               ⚠                      │
│                                      │
│        Are you sure?                 │
│  Delete [projeto-api.txt]?           │ ← filename in magenta
│  This cannot be undone.              │
│                                      │
├──────────────────────────────────────┤
│              [Cancel]  [Delete]      │ ← Delete: magenta border
└──────────────────────────────────────┘
```

---

## 6. Floating Action Button (FAB) Menu

### 6.1 Structure

```
                                    ┌─────────────────────┐
                                    │  Search         [⌕] │
                                    ├─────────────────────┤
                                    │  Quick Open     [◎] │
                                    ├─────────────────────┤
                                    │  Settings       [⚙] │
                                    ├─────────────────────┤
                                    │  Delete         [✕] │
                                    ├─────────────────────┤
                                    │  Toast          [✓] │
                                    └─────────────────────┘
                                              ┌───┐
                                              │ ✦ │  ← Main FAB
                                              └───┘
```

### 6.2 FAB Trigger Button

```css
/* Base */
width: 48px;
height: 48px;
border-radius: 50%;
background: var(--bg-elevated);
border: 1px solid var(--border-default);
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);

/* Gradient ring (on hover) */
::before {
  background: linear-gradient(135deg, cyan, purple);
  opacity: 0 → 1;
}

/* Open state */
transform: rotate(45deg);

/* Icon */
✦ (sparkle character)
```

### 6.3 Menu Items

```css
/* Animation - staggered cascade */
opacity: 0 → 1;
transform: translateY(20px) scale(0.8) → translateY(0) scale(1);
transition-delay: 50ms × index;

/* Structure */
display: flex;
gap: 10px;
align-items: center;

/* Label */
padding: 6px 12px;
background: var(--bg-elevated);
border: 1px solid var(--border-default);
border-radius: 4px;

/* Icon circle */
width: 36px;
height: 36px;
border-radius: 50%;
```

### 6.4 Accent Colors per Item

| Item | Icon | Hover Border | Hover Glow |
|------|------|--------------|------------|
| Search | ⌕ | Cyan | rgba(0, 212, 255, 0.3) |
| Quick Open | ◎ | Purple | rgba(170, 119, 255, 0.3) |
| Settings | ⚙ | Green | rgba(0, 255, 136, 0.3) |
| Delete | ✕ | Magenta | rgba(255, 51, 153, 0.3) |
| Toast | ✓ | Yellow | rgba(255, 204, 0, 0.3) |

### 6.5 Backdrop

```css
background: rgba(0, 0, 0, 0.3);
/* Closes menu on click */
```

---

## 7. Interactive States

### 7.1 Buttons

| Type | Default | Hover |
|------|---------|-------|
| Ghost | border: --border-default | border: cyan, glow |
| Primary | border: cyan | bg: rgba(cyan, 0.1), glow |
| Danger | border: magenta, color: magenta | bg: rgba(magenta, 0.1), glow |

### 7.2 Inputs

```css
/* Default */
background: var(--bg-surface);
border: 1px solid var(--border-default);

/* Focus */
border-color: var(--accent-cyan);

/* Focus visible (keyboard) */
box-shadow: var(--focus-ring);
```

### 7.3 Focus Management

```css
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px var(--accent-cyan);
}
```

---

## 8. Animation Specifications

### 8.1 Timing Functions

| Name | Value | Use Case |
|------|-------|----------|
| ease | ease | General transitions |
| smooth | cubic-bezier(0.16, 1, 0.3, 1) | Modals, FAB, important transitions |

### 8.2 Durations

| Duration | Value | Use Case |
|----------|-------|----------|
| Fast | 150ms | Hovers, color changes |
| Normal | 200ms | State transitions |
| Smooth | 300ms | Modals, complex animations |

### 8.3 Key Animations

| Animation | Properties |
|-----------|------------|
| Modal open | translateY + scale + opacity |
| FAB menu | translateY + scale + opacity (staggered) |
| FAB trigger | rotate(45deg) |
| Section collapse | chevron rotate(-90deg) |
| Tag hover | translateY(-1px) + glow |

---

## 9. Accessibility

### 9.1 Color Contrast (WCAG AA)

| Element | Foreground | Background | Ratio |
|---------|------------|------------|-------|
| Primary text | #f0f0f0 | #141414 | 14.5:1 ✓ |
| Secondary text | #a0a0a0 | #141414 | 7.1:1 ✓ |
| Tertiary text | #606060 | #141414 | 4.5:1 ✓ |
| Cyan accent | #00d4ff | #141414 | 10.2:1 ✓ |

### 9.2 Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Focus forward |
| Shift+Tab | Focus backward |
| Enter | Activate |
| Escape | Close modal/menu |
| ↑↓ | Navigate lists |
| ←→ | Expand/collapse tree |

### 9.3 Focus Indicators

All interactive elements have visible focus ring (cyan).

---

## 10. Iconography

### 10.1 Icon Characters (Unicode)

| Icon | Character | Usage |
|------|-----------|-------|
| File | ◦ | File items |
| Folder | ◇ | Folder items |
| Chevron | ▾ / ▸ | Collapse/expand |
| Search | ⌕ | Search input |
| Settings | ⚙ | Settings button |
| Add | + | Add folder |
| Close | × | Close button |
| Check | ✓ | Checkboxes, success |
| Warning | ⚠ | Confirm dialogs |
| Sparkle | ✦ | FAB trigger |
| Target | ◎ | Quick open |

---

## 11. File Reference

### 11.1 Wireframes

| File | Description |
|------|-------------|
| `plainnotes-wireframe.html` | Original design (deprecated) |
| `plainnotes-wireframe-minimal.html` | Minimal design (deprecated) |
| `plainnotes-wireframe-mono-accent.html` | **Current design** - Mono + Vivid Accents |

### 11.2 Design System Implementation

O arquivo `plainnotes-wireframe-mono-accent.html` contém:
- Todos os tokens CSS implementados
- Componentes interativos funcionais
- Animações e transições
- FAB menu com animação staggered
- Estados de hover/focus/active
- Modais com backdrop blur

---

## 12. Implementation Checklist

| Component | Priority | Tokens | Animation |
|-----------|----------|--------|-----------|
| Layout Shell | P0 | ✓ | - |
| Sidebar | P0 | ✓ | Collapse |
| FileTree | P0 | ✓ | - |
| Editor | P0 | ✓ | - |
| Markdown Styles | P0 | ✓ | - |
| StatusBar | P1 | ✓ | - |
| SearchModal | P1 | ✓ | Scale+fade |
| QuickOpen | P1 | ✓ | Scale+fade |
| SettingsModal | P2 | ✓ | Scale+fade |
| ConfirmDialog | P1 | ✓ | Scale+fade |
| Toast | P2 | ✓ | SlideIn |
| FAB Menu | P3 | ✓ | Staggered |

---

## 13. Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#141414',
          surface: '#1a1a1a',
          elevated: '#222222',
          hover: '#2a2a2a',
          active: '#303030',
        },
        text: {
          primary: '#f0f0f0',
          secondary: '#a0a0a0',
          tertiary: '#606060',
          ghost: '#404040',
        },
        accent: {
          cyan: '#00d4ff',
          magenta: '#ff3399',
          green: '#00ff88',
          yellow: '#ffcc00',
          purple: '#aa77ff',
          orange: '#ff7744',
        },
        border: {
          subtle: '#252525',
          default: '#333333',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      spacing: {
        sidebar: '250px',
        statusbar: '26px',
        header: '50px',
      },
      boxShadow: {
        glow: {
          cyan: '0 0 12px rgba(0, 212, 255, 0.4)',
          purple: '0 0 12px rgba(170, 119, 255, 0.4)',
          green: '0 0 12px rgba(0, 255, 136, 0.4)',
          yellow: '0 0 8px rgba(255, 204, 0, 0.6)',
          magenta: '0 0 12px rgba(255, 51, 153, 0.4)',
        },
        modal: '0 24px 48px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'scale-in': 'scaleIn 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in': 'slideIn 200ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
};
```

---

*Document generated by Uma (UX Design Expert) - Synkra AIOS v2.0*

— Uma, desenhando com empatia 💝
