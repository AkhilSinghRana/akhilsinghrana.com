"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"

interface ThemeContextType {
  isDark: boolean
  toggle: () => void
}

export const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggle: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem("theme")
    const dark = saved ? saved === "dark" : true
    setIsDark(dark)
    document.documentElement.classList.toggle("dark", dark)
    document.documentElement.classList.toggle("light", !dark)
  }, [])

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev
      localStorage.setItem("theme", next ? "dark" : "light")
      document.documentElement.classList.toggle("dark", next)
      document.documentElement.classList.toggle("light", !next)
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}
