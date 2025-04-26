'use client'

import { createContext, ReactNode, useState, useContext, useEffect } from 'react'

type SettingsContextType = {
  outputPath: string
  setOutputPath: (path: string) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [outputPath, setOutputPath] = useState<string>('')

  // Carregar estado do localStorage na montagem inicial
  useEffect(() => {
    const savedPath = localStorage.getItem('outputPath')
    if (savedPath) {
      setOutputPath(savedPath)
    }
  }, [])

  const handleSetOutputPath = (path: string) => {
    setOutputPath(path)
    localStorage.setItem('outputPath', path)
  }

  return (
    <SettingsContext.Provider value={{ outputPath, setOutputPath: handleSetOutputPath }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings deve ser usado dentro de um SettingsProvider')
  }
  return context
} 