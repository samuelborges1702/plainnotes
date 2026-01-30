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
    <header className="flex items-center justify-between h-10 bg-bg-elevated border-b border-border-subtle titlebar-drag select-none">
      {/* App title */}
      <div className="flex items-center gap-2 px-4">
        <span className="text-lg font-semibold text-gradient-cyan">PlainNotes</span>
      </div>

      {/* Window controls */}
      <div className="flex items-center titlebar-no-drag">
        <button
          onClick={handleMinimize}
          className="flex items-center justify-center w-12 h-10 text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
          title="Minimize"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleMaximize}
          className="flex items-center justify-center w-12 h-10 text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? <Copy className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={handleClose}
          className="flex items-center justify-center w-12 h-10 text-text-secondary hover:text-white hover:bg-status-error transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
