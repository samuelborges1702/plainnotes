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
    <header className="flex items-center justify-between h-10 bg-bg-elevated border-b border-border-subtle titlebar-drag select-none z-50">
      {/* App title - empty, title is in sidebar */}
      <div className="flex items-center gap-2 px-4 titlebar-no-drag">
        {/* Drag area indicator */}
      </div>

      {/* Window controls - must be outside drag region */}
      <div className="flex items-center h-full titlebar-no-drag" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          onClick={handleMinimize}
          className="flex items-center justify-center w-12 h-10 text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
          title="Minimize"
          type="button"
        >
          <Minus className="w-4 h-4 pointer-events-none" />
        </button>
        <button
          onClick={handleMaximize}
          className="flex items-center justify-center w-12 h-10 text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
          title={isMaximized ? 'Restore' : 'Maximize'}
          type="button"
        >
          {isMaximized ? <Copy className="w-3.5 h-3.5 pointer-events-none" /> : <Square className="w-3.5 h-3.5 pointer-events-none" />}
        </button>
        <button
          onClick={handleClose}
          className="flex items-center justify-center w-12 h-10 text-text-secondary hover:text-white hover:bg-status-error transition-colors cursor-pointer"
          title="Close"
          type="button"
        >
          <X className="w-4 h-4 pointer-events-none" />
        </button>
      </div>
    </header>
  )
}
