import { vi } from 'vitest'

const storage = new Map()

globalThis.uni = {
  getStorageSync: (key) => {
    const val = storage.get(key)
    return val !== undefined ? JSON.parse(JSON.stringify(val)) : ''
  },
  setStorageSync: (key, data) => { storage.set(key, data) },
  removeStorageSync: (key) => { storage.delete(key) },
  getStorageInfoSync: () => ({ keys: [...storage.keys()] }),
  showToast: vi.fn(),
  showModal: vi.fn(),
  vibrateShort: vi.fn(),
  switchTab: vi.fn(),
  reLaunch: vi.fn(),
  setNavigationBarColor: vi.fn(),
  setBackgroundColor: vi.fn(),
  getSystemInfoSync: () => ({ statusBarHeight: 44, windowWidth: 375 }),
}

globalThis.__clearMockStorage = () => storage.clear()

if (typeof document === 'undefined') {
  const noop = () => ({})
  const makeEl = () => ({
    setAttribute: noop, removeAttribute: noop,
    style: {}, classList: { add: noop, remove: noop, contains: () => false },
    addEventListener: noop, removeEventListener: noop,
    appendChild: noop, insertBefore: noop, removeChild: noop,
    querySelectorAll: () => [], querySelector: () => null,
    childNodes: [], children: [], firstChild: null, parentNode: null,
    tagName: 'DIV', nodeType: 1, textContent: '',
    cloneNode: () => makeEl(),
  })
  globalThis.document = {
    documentElement: makeEl(),
    createElement: () => makeEl(),
    createElementNS: () => makeEl(),
    createTextNode: () => makeEl(),
    createComment: () => makeEl(),
    querySelectorAll: () => [],
    querySelector: () => null,
    body: makeEl(),
    head: makeEl(),
    addEventListener: noop,
    removeEventListener: noop,
  }
}
