import { useState, useEffect } from 'react'
import { Minus, Square, X, Copy } from 'lucide-react'

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    const checkMaximized = async () => {
      const maximized = await window.api.isMaximized()
      setIsMaximized(maximized)
    }
    checkMaximized()
  }, [])

  const handleMinimize = () => window.api.minimizeWindow()

  const handleMaximize = () => {
    window.api.maximizeWindow()
    setIsMaximized(!isMaximized)
  }

  const handleClose = () => window.api.closeWindow()

  return (
    <header className="flex items-center justify-between h-10 bg-bg-elevated border-b border-border-subtle select-none z-50">
      {/* Drag region - ONLY this div is draggable */}
      <div className="flex-1 h-full titlebar-drag" />

      {/* Window controls - completely OUTSIDE drag region with explicit styles */}
      <div
        className="window-controls flex items-center h-full"
        style={{
          WebkitAppRegion: 'no-drag',
          position: 'relative',
          zIndex: 9999,
        } as React.CSSProperties}
      >
        <button
          onClick={handleMinimize}
          className="window-control-btn flex items-center justify-center w-12 h-10 text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
          title="Minimize"
          type="button"
          style={{ WebkitAppRegion: 'no-drag', pointerEvents: 'auto' } as React.CSSProperties}
        >
          <Minus className="w-4 h-4 pointer-events-none" />
        </button>
        <button
          onClick={handleMaximize}
          className="window-control-btn flex items-center justify-center w-12 h-10 text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
          title={isMaximized ? 'Restore' : 'Maximize'}
          type="button"
          style={{ WebkitAppRegion: 'no-drag', pointerEvents: 'auto' } as React.CSSProperties}
        >
          {isMaximized ? <Copy className="w-3.5 h-3.5 pointer-events-none" /> : <Square className="w-3.5 h-3.5 pointer-events-none" />}
        </button>
        <button
          onClick={handleClose}
          className="window-control-btn flex items-center justify-center w-12 h-10 text-text-secondary hover:text-white hover:bg-status-error transition-colors"
          title="Close"
          type="button"
          style={{ WebkitAppRegion: 'no-drag', pointerEvents: 'auto' } as React.CSSProperties}
        >
          <X className="w-4 h-4 pointer-events-none" />
        </button>
      </div>
    </header>
  )
}
