<template>
  <view class="tt-config-provider" :style="rootStyle">
    <slot />
  </view>
</template>

<script setup >import { computed, provide, inject } from "vue";
import { configProviderProps } from "./props";
import { useTheme } from "../../composables/use-theme";
import { lightTokens, darkTokens } from "../../styles/tokens";
import { tokensToStyle, diffTokens } from "../../utils/token-to-var";
const TT_CONFIG_KEY = "tt-config";
const TT_TOKENS_KEY = "tt-tokens";
const props = defineProps(configProviderProps);
const { resolvedTheme, initTheme } = useTheme();
initTheme();
const activeTheme = computed(() => props.theme ?? resolvedTheme.value);
const parentTokens = inject(TT_TOKENS_KEY, null);
const fullTokens = computed(() => {
  const base = activeTheme.value === "dark" ? darkTokens : lightTokens;
  return { ...base, ...props.themeVars };
});
const rootStyle = computed(() => {
  if (parentTokens) {
    const diff = diffTokens(parentTokens, fullTokens.value);
    return tokensToStyle(diff);
  }
  return tokensToStyle(fullTokens.value);
});
provide(TT_TOKENS_KEY, fullTokens.value);
provide(TT_CONFIG_KEY, { theme: activeTheme });
</script>

<style>
.tt-config-provider {
  width: 100%;
  min-height: 100%;
}
</style>
