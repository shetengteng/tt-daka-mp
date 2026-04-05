<script>
	import { useThemeStore } from '@/stores/theme'
	import { isLoggedIn, getLoginType } from '@/utils/auth'
	import { initEmas } from '@/cloud-emas/database/index'
	import { anonymousAuth } from '@/cloud-emas/database/api/anonymousAuth'
	import { wechatAuth } from '@/cloud-emas/database/api/wechatAuth'
	
	export default {
		onLaunch: function() {
			const themeStore = useThemeStore()
			themeStore.applyTheme()
			
			if (isLoggedIn()) {
				const loginType = getLoginType()
				const authFn = loginType === 'wechat' ? wechatAuth : anonymousAuth
				
				initEmas()
					.then(() => authFn())
					.catch((err) => {
						console.error('[App] 启动授权恢复失败:', err)
					})
			}
		},
		onShow: function() {},
		onHide: function() {}
	}
</script>

<style lang="scss">
	@font-face {
		font-family: 'Pacifico';
		src: url('/static/fonts/Pacifico-DaKa.woff2') format('woff2'),
			url('/static/fonts/Pacifico-DaKa.ttf') format('truetype');
		font-weight: 400;
		font-style: normal;
		font-display: swap;
		unicode-range: U+44, U+4B, U+61;
	}
	@import '@/styles/global.scss';
</style>
