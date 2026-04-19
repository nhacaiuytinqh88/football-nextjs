'use client'

import { createContext, useContext, useEffect } from 'react'

interface ThemeContextType {
  theme: 'light'
  resolvedTheme: 'light'
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'light', resolvedTheme: 'light' })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Luôn dùng light mode
    const root = window.document.documentElement
    root.classList.remove('dark')
    root.classList.add('light')
    localStorage.removeItem('theme')
  }, [])

  return (
    <ThemeContext.Provider value={{ theme: 'light', resolvedTheme: 'light' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
