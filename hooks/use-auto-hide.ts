'use client'

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'

export function useAutoHide(active: boolean, delay = 3000) {
  const visibleRef = useRef(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const listenersRef = useRef(new Set<() => void>())

  const subscribe = useCallback((cb: () => void) => {
    listenersRef.current.add(cb)
    return () => { listenersRef.current.delete(cb) }
  }, [])

  const getSnapshot = useCallback(() => visibleRef.current, [])

  const setVisible = useCallback((v: boolean) => {
    if (visibleRef.current !== v) {
      visibleRef.current = v
      listenersRef.current.forEach((cb) => cb())
    }
  }, [])

  useEffect(() => {
    if (!active) {
      setVisible(true)
      return
    }

    const hide = () => {
      timeoutRef.current = setTimeout(() => setVisible(false), delay)
    }
    const show = () => {
      setVisible(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      hide()
    }

    hide()
    window.addEventListener('mousemove', show)
    window.addEventListener('touchstart', show)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      window.removeEventListener('mousemove', show)
      window.removeEventListener('touchstart', show)
    }
  }, [active, delay, setVisible])

  return useSyncExternalStore(subscribe, getSnapshot, () => true)
}
