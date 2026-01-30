import { useState } from 'react'
import { Search, FolderOpen, Settings, Sparkles, X } from 'lucide-react'
import { clsx } from 'clsx'

interface FloatingActionButtonProps {
  onSearch?: () => void
  onQuickOpen?: () => void
  onSettings?: () => void
  onNewNote?: () => void
}

export function FloatingActionButton({
  onSearch,
  onQuickOpen,
  onSettings,
  onNewNote,
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  const handleAction = (action?: () => void) => {
    action?.()
    setIsOpen(false)
  }

  const menuItems = [
    { icon: Search, label: 'Search', action: onSearch, color: 'cyan' },
    { icon: FolderOpen, label: 'Quick Open', action: onQuickOpen, color: 'purple' },
    { icon: Settings, label: 'Settings', action: onSettings, color: 'green' },
    { icon: Sparkles, label: 'New Note', action: onNewNote, color: 'yellow' },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 bg-black/30 z-[1999] transition-all duration-300',
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* FAB Container */}
      <div className="fixed bottom-6 right-6 z-[2000]">
        {/* Menu Items */}
        <div className="absolute bottom-14 right-0 flex flex-col items-end gap-2">
          {menuItems.map((item, index) => (
            <div
              key={item.label}
              className={clsx(
                'flex items-center gap-2.5 transition-all duration-300',
                isOpen
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-5 scale-80 pointer-events-none'
              )}
              style={{
                transitionDelay: isOpen ? `${index * 50}ms` : `${(menuItems.length - index - 1) * 30}ms`,
              }}
            >
              {/* Label */}
              <span
                className={clsx(
                  'fab-label px-3 py-1.5 bg-bg-elevated border border-border-default rounded-md',
                  'text-xs font-medium text-text-secondary whitespace-nowrap',
                  'shadow-lg transition-all duration-150',
                  `hover:text-text-primary hover:border-accent-${item.color}`
                )}
              >
                {item.label}
              </span>

              {/* Icon Button */}
              <button
                onClick={() => handleAction(item.action)}
                className={clsx(
                  'fab-item w-9 h-9 rounded-full bg-bg-elevated border border-border-default',
                  'flex items-center justify-center text-text-secondary',
                  'shadow-lg cursor-pointer transition-all duration-150',
                  `hover:scale-110 hover:border-accent-${item.color} hover:text-text-primary`,
                  `hover:shadow-[0_0_16px_var(--accent-${item.color})/30]`
                )}
                style={{ WebkitAppRegion: 'no-drag', pointerEvents: 'auto' } as React.CSSProperties}
                type="button"
              >
                <item.icon className="w-4 h-4 pointer-events-none" />
              </button>
            </div>
          ))}
        </div>

        {/* Main FAB Trigger */}
        <button
          onClick={toggleMenu}
          className={clsx(
            'fab-trigger w-12 h-12 rounded-full bg-bg-elevated border border-border-default',
            'flex items-center justify-center text-text-secondary text-xl',
            'shadow-lg cursor-pointer transition-all duration-300 relative',
            'hover:text-text-primary hover:scale-105',
            isOpen && 'rotate-45 bg-bg-active'
          )}
          style={{ WebkitAppRegion: 'no-drag', pointerEvents: 'auto' } as React.CSSProperties}
          type="button"
          title="Quick Actions"
        >
          {/* Gradient border on hover/open */}
          <span
            className={clsx(
              'absolute inset-[-2px] rounded-full',
              'bg-gradient-to-br from-accent-cyan via-accent-purple to-accent-magenta',
              'z-[-1] transition-opacity duration-300',
              isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            )}
          />
          {isOpen ? (
            <X className="w-5 h-5 pointer-events-none" />
          ) : (
            <Sparkles className="w-5 h-5 pointer-events-none" />
          )}
        </button>
      </div>
    </>
  )
}
