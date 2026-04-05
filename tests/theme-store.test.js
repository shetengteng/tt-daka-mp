import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useThemeStore } from '@/stores/theme'

beforeEach(() => {
  globalThis.__clearMockStorage()
  setActivePinia(createPinia())
})

describe('themeStore', () => {
  it('defaults to light mode', () => {
    const store = useThemeStore()
    expect(store.mode).toBe('light')
    expect(store.isDark).toBe(false)
  })

  it('toggle switches to dark', () => {
    const store = useThemeStore()
    store.toggle()
    expect(store.mode).toBe('dark')
    expect(store.isDark).toBe(true)
  })

  it('toggle twice returns to light', () => {
    const store = useThemeStore()
    store.toggle()
    store.toggle()
    expect(store.mode).toBe('light')
  })

  it('setMode sets specific mode', () => {
    const store = useThemeStore()
    store.setMode('dark')
    expect(store.isDark).toBe(true)
    store.setMode('light')
    expect(store.isDark).toBe(false)
  })

  it('colors change with mode', () => {
    const store = useThemeStore()
    const lightFg = store.c.fg
    store.toggle()
    const darkFg = store.c.fg
    expect(lightFg).not.toBe(darkFg)
  })

  it('themeStyle returns CSS vars in dark mode', () => {
    const store = useThemeStore()
    expect(store.themeStyle).toBe('')
    store.toggle()
    expect(store.themeStyle).toContain('--tt-background')
    expect(store.themeStyle).toContain('#09090B')
  })

  it('statusBarHeight has a default value', () => {
    const store = useThemeStore()
    expect(store.statusBarHeight).toBeTypeOf('number')
    expect(store.statusBarHeight).toBeGreaterThan(0)
  })
})
