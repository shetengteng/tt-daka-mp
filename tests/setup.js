import { vi } from 'vitest'

const storage = new Map()

globalThis.uni = {
  getStorageSync: (key) => {
    const val = storage.get(key)
    return val !== undefined ? JSON.parse(JSON.stringify(val)) : ''
  },
  setStorageSync: (key, data) => { storage.set(key, data) },
  removeStorageSync: (key) => { storage.delete(key) },
  showToast: vi.fn(),
  showModal: vi.fn(),
  vibrateShort: vi.fn(),
  switchTab: vi.fn(),
  reLaunch: vi.fn(),
}

globalThis.__clearMockStorage = () => storage.clear()
