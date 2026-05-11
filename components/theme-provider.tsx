'use client'

import { createContext, useCallback, useContext, useLayoutEffect, useRef, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'light',
  toggle: () => {},
})

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem('theme') as Theme | null
  return stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeRef = useRef<Theme>(getInitialTheme())
  const listenersRef = useRef(new Set<() => void>())

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', themeRef.current === 'dark')
  }, [])

  const subscribe = useCallback((cb: () => void) => {
    listenersRef.current.add(cb)
    return () => { listenersRef.current.delete(cb) }
  }, [])

  const getSnapshot = useCallback(() => themeRef.current, [])

  const theme = useSyncExternalStore(subscribe, getSnapshot, () => 'light' as Theme)

  const toggle = useCallback(() => {
    const next = themeRef.current === 'light' ? 'dark' : 'light'
    themeRef.current = next
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    listenersRef.current.forEach((cb) => cb())
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
