import { ref, computed } from "vue";
const STORAGE_KEY = "tt-shaduni-theme";
const themeMode = ref("system");
const systemTheme = ref("light");
let initialized = false;
function initTheme() {
  if (initialized) return;
  initialized = true;
  try {
    const stored = uni.getStorageSync(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      themeMode.value = stored;
    }
  } catch {
  }
  try {
    const sysInfo = uni.getSystemInfoSync();
    systemTheme.value = sysInfo.theme === "dark" ? "dark" : "light";
  } catch {
  }
  uni.onThemeChange?.((res) => {
    systemTheme.value = res.theme === "dark" ? "dark" : "light";
  });
}
const resolvedTheme = computed(() => {
  if (themeMode.value === "system") return systemTheme.value;
  return themeMode.value;
});
function setTheme(mode) {
  themeMode.value = mode;
  try {
    uni.setStorageSync(STORAGE_KEY, mode);
  } catch {
  }
}
function toggleTheme() {
  setTheme(resolvedTheme.value === "light" ? "dark" : "light");
}
function useTheme() {
  return {
    themeMode,
    resolvedTheme,
    isDark: computed(() => resolvedTheme.value === "dark"),
    setTheme,
    toggleTheme,
    initTheme
  };
}
export {
  useTheme
};
