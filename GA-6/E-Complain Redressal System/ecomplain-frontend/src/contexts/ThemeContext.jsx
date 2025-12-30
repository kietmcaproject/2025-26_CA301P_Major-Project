import { createContext, useContext, useState, useEffect, useMemo } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      return savedTheme === 'dark'
    }
    // Default to light mode for better performance
    return false
  })

  const toggleTheme = useMemo(() => () => {
    setIsDarkMode(prev => !prev)
  }, [])

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
    
    // Update document class for global styling
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  const value = useMemo(() => ({
    isDarkMode,
    toggleTheme,
    mode: isDarkMode ? 'dark' : 'light'
  }), [isDarkMode, toggleTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
