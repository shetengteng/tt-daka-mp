import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import pinia from '@/stores/index'
import { useThemeStore } from '@/stores/theme'

export function createApp() {
  const app = createSSRApp(App)
  app.use(pinia)
  
  app.mixin({
    onShow() {
      const themeStore = useThemeStore()
      themeStore.applyTheme()
    }
  })
  
  return { app }
}
// #endif
