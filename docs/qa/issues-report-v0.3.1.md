# QA Issues Report - PlainNotes v0.3.1

**Data:** 2026-01-30
**Analista:** Quinn (QA Agent)
**Versão Analisada:** v0.3.1

---

## Resumo Executivo

| Severidade | Quantidade |
|------------|------------|
| 🔴 Crítico | 2 |
| 🟠 Alto | 1 |
| 🟡 Médio | 4 |
| 🟢 Baixo | 3 |

**Status Geral:** ❌ FAIL - Bugs críticos impedem uso básico

---

## 🔴 Issues Críticos

### ISSUE-001: Botões de controle da janela não funcionam no Windows

**Severidade:** 🔴 Crítico
**Componente:** TitleBar
**Arquivo:** `src/renderer/components/layout/TitleBar.tsx`

#### Descrição
Os botões de controle da janela (minimize, maximize, close) não respondem a cliques no Windows.

#### Passos para Reproduzir
1. Instalar PlainNotes v0.3.1 no Windows
2. Clicar no botão minimize (−) → Nada acontece
3. Clicar no botão maximize (□) → Nada acontece
4. Clicar no botão close (×) → Nada acontece

#### Comportamento Esperado
- Minimize deve minimizar a janela
- Maximize deve alternar entre maximizado/restaurado
- Close deve fechar a aplicação

#### Análise da Causa Raiz

O problema está relacionado à propriedade CSS `-webkit-app-region: drag` no Electron para Windows.

**Implementação Atual** (`TitleBar.tsx:25`):
```tsx
<header className="flex items-center ... titlebar-drag ...">
  <div className="... titlebar-no-drag" style={{ WebkitAppRegion: 'no-drag' }}>
    <button onClick={handleMinimize}>...
```

**Problema:**
Mesmo com a classe `titlebar-no-drag` e estilo inline, a região de drag pode estar interceptando eventos de clique no Windows devido à forma como o Chromium lida com a herança de `-webkit-app-region`.

#### Solução Proposta

```tsx
// TitleBar.tsx - Reestruturar para separar drag region dos controles
export function TitleBar() {
  return (
    <header className="flex items-center justify-between h-10 bg-bg-elevated border-b border-border-subtle select-none">
      {/* Área de drag SEPARADA - apenas no título */}
      <div className="flex-1 h-full titlebar-drag" />

      {/* Controles da janela - FORA da região de drag, position absolute */}
      <div
        className="flex items-center h-full"
        style={{
          WebkitAppRegion: 'no-drag',
          position: 'relative',
          zIndex: 100
        }}
      >
        <button onClick={handleMinimize}>...
      </div>
    </header>
  )
}
```

Também adicionar em `globals.css`:
```css
/* Garantir que botões de controle não herdem drag */
.window-controls {
  -webkit-app-region: no-drag !important;
  pointer-events: auto !important;
  z-index: 9999;
}
```

#### Arquivos Afetados
- `src/renderer/components/layout/TitleBar.tsx`
- `src/renderer/styles/globals.css`

---

### ISSUE-002: Botão Add Folder não funciona

**Severidade:** 🔴 Crítico
**Componente:** Sidebar
**Arquivo:** `src/renderer/components/layout/Sidebar.tsx`

#### Descrição
O botão "Add Folder" no header da Sidebar não responde a cliques.

#### Passos para Reproduzir
1. Iniciar PlainNotes no Windows
2. Clicar no ícone de pasta (📁+) no header da sidebar
3. Nada acontece - nenhum diálogo de pasta aparece

#### Comportamento Esperado
Clicar no botão Add Folder deve abrir o seletor de pasta nativo do sistema.

#### Análise da Causa Raiz

Relacionado ao ISSUE-001. A propriedade CSS `-webkit-app-region: drag` pode estar propagando para elementos filhos e bloqueando eventos de clique.

**Implementação Atual** (`Sidebar.tsx:68-73`):
```tsx
const handleAddFolder = async () => {
  const path = await window.api.selectFolder()
  if (path) {
    await addSource(path)
  }
}
```

O handler IPC está corretamente implementado em `src/main/ipc/index.ts:50-61`, então o problema está na camada do renderer.

#### Solução Proposta

Adicionar estilos explícitos ao botão:
```tsx
<button
  onClick={handleAddFolder}
  className="p-1.5 rounded-md ..."
  style={{
    WebkitAppRegion: 'no-drag',
    pointerEvents: 'auto'
  }}
>
```

---

## 🟠 Issues de Alta Prioridade

### ISSUE-003: Design divergente do wireframe aprovado

**Severidade:** 🟠 Alto
**Componente:** UI Geral
**Referência:** `docs/design/wireframes/plainnotes-wireframe-mono-accent.html`

#### Divergências Principais

| Elemento | Wireframe | Atual | Impacto |
|----------|-----------|-------|---------|
| Botões do sidebar header | Add Folder (+) E Settings (⚙) | Apenas Add Folder | Falta acesso a configurações |
| Estilo hover dos ícones | `border-color: var(--accent-cyan)` | Estilo diferente | Inconsistência visual |
| Ordem das seções | Recent → Tags → Notes | Tags → Recent → Files | Inconsistência UX |
| Altura do header | 50px | 56px (h-14) | Diferença de layout |

#### Variáveis CSS do Wireframe
```css
:root {
  --sidebar-width: 250px;
  --statusbar-height: 26px;
  --header-height: 50px;
  --font-sans: 'Inter', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

#### Critérios de Aceitação
- [ ] Adicionar botão Settings ao header da sidebar
- [ ] Corrigir hover dos ícones para mostrar borda cyan
- [ ] Reordenar seções para corresponder ao wireframe
- [ ] Ajustar altura do header para 50px
- [ ] Aplicar `border-left` accent consistente em itens ativos

---

## 🟡 Issues de Média Prioridade

### ISSUE-004: Estado ativo dos itens da lista inconsistente

**Severidade:** 🟡 Médio
**Componente:** Sidebar

O wireframe especifica:
```css
.list-item.active {
  border-left-color: var(--accent-cyan);
}
```

A implementação atual usa uma abordagem diferente.

---

### ISSUE-005: Tamanhos de fonte diferentes do wireframe

**Severidade:** 🟡 Médio
**Componente:** Tipografia

| Elemento | Wireframe | Atual |
|----------|-----------|-------|
| Base | 13px | 14px |
| Sidebar items | 13px | 12px (text-sm) |

---

### ISSUE-006: Padding do editor diferente

**Severidade:** 🟡 Médio
**Componente:** Editor

Wireframe: `padding: 48px 64px`
Atual: Valores diferentes no CodeMirror theme

---

### ISSUE-007: Falta Settings no sidebar header

**Severidade:** 🟡 Médio
**Componente:** Sidebar

O wireframe mostra dois botões no header:
1. Add Folder (+)
2. Settings (⚙)

Apenas Add Folder está implementado.

---

## 🟢 Issues de Baixa Prioridade

### ISSUE-008: Indicador de modificação sem glow

**Severidade:** 🟢 Baixo
**Componente:** Editor Header

Wireframe especifica dot amarelo com `box-shadow: 0 0 8px var(--accent-yellow)`.
Atual: Bolinha simples sem efeito de glow.

---

### ISSUE-009: Status bar font inconsistente

**Severidade:** 🟢 Baixo
**Componente:** StatusBar

Wireframe usa `font-family: var(--font-mono)` consistentemente.
Atual: Parcialmente aplicado.

---

### ISSUE-010: Resize handle do sidebar não visível

**Severidade:** 🟢 Baixo
**Componente:** Sidebar

Wireframe especifica um indicador visual de resize:
```css
.sidebar::after {
  content: "";
  width: 3px;
  height: 32px;
  background: var(--border-default);
  opacity: 0; /* Aparece no hover */
}
```

---

## Recomendações

### Prioridade Imediata (v0.3.2)
1. ✅ Corrigir ISSUE-001 (window controls)
2. ✅ Corrigir ISSUE-002 (add folder)
3. Testar exaustivamente no Windows

### Próximo Sprint (v0.4.0)
1. Implementar ISSUE-003 (alinhar com wireframe)
2. Adicionar Settings ao sidebar
3. Reordenar seções

### Backlog
- Issues 004-010 (baixa/média prioridade)

---

## Ambiente de Teste

- **OS:** Windows 10/11
- **Electron:** v28.1.0
- **Node.js:** v20.x
- **PlainNotes:** v0.3.1

---

*— Quinn, guardião da qualidade 🛡️*
