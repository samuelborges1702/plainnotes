import { useEffect } from 'react'
import { TitleBar } from './components/layout/TitleBar'
import { Sidebar } from './components/layout/Sidebar'
import { Editor } from './components/layout/Editor'
import { StatusBar } from './components/layout/StatusBar'
import { useAppStore } from './stores/appStore'

function App() {
  const { loadConfig, buildSearchIndex } = useAppStore()

  useEffect(() => {
    // Initialize app
    const init = async () => {
      await loadConfig()
      await buildSearchIndex()
    }
    init()
  }, [loadConfig, buildSearchIndex])

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Editor />
      </div>
      <StatusBar />
    </div>
  )
}

export default App
