/**
 * Pinia Store 入口
 */
import { createPinia } from 'pinia'

const pinia = createPinia()

const uniPersistPlugin = ({ store, options }) => {
  const persistConfig = options?.persist
  if (!persistConfig) return
  
  const { key, paths } = persistConfig
  
  try {
    const saved = uni.getStorageSync(key)
    if (saved) {
      const data = typeof saved === 'string' ? JSON.parse(saved) : saved
      store.$patch(data)
    }
  } catch (error) {
    console.warn(`[Pinia] 恢复状态失败: ${key}`, error)
  }
  
  store.$subscribe((mutation, state) => {
    try {
      const saveData = {}
      if (paths && Array.isArray(paths)) {
        paths.forEach(path => {
          if (state[path] !== undefined) {
            saveData[path] = state[path]
          }
        })
      } else {
        Object.assign(saveData, state)
      }
      uni.setStorageSync(key, JSON.stringify(saveData))
    } catch (error) {
      console.warn(`[Pinia] 保存状态失败: ${key}`, error)
    }
  })
}

pinia.use(uniPersistPlugin)

export default pinia
