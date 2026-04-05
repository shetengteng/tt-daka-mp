<script>
	import { useThemeStore } from '@/stores/theme'
	import { isLoggedIn, getLoginType } from '@/utils/auth'
	import { initEmas } from '@/cloud-emas/database/index'
	import { anonymousAuth } from '@/cloud-emas/database/api/anonymousAuth'
	import { ensureUser } from '@/pages/mine/api/ensureUser'
	
	export default {
		onLaunch: function() {
			const themeStore = useThemeStore()
			themeStore.applyTheme()
			
			if (isLoggedIn()) {
				initEmas()
					.then(() => anonymousAuth())
					.then(() => ensureUser({ loginType: getLoginType() }))
					.catch(() => {})
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
