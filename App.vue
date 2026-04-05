<script>
	import { useThemeStore } from '@/stores/theme'
	import { useProjectStore } from '@/stores/project'
	import { useRecordStore } from '@/stores/record'
	import { isLoggedIn, getLoginType, getAccountId } from '@/utils/auth'
	import { initEmas } from '@/cloud-emas/database/index'
	import { anonymousAuth } from '@/cloud-emas/database/api/anonymousAuth'
	import { wechatAuth } from '@/cloud-emas/database/api/wechatAuth'
	import { syncPendingOps } from '@/utils/sync-manager'
	import { getPendingCount } from '@/utils/pending-ops'
	
	export default {
		onLaunch: function() {
			const themeStore = useThemeStore()
			themeStore.applyTheme()
			
			const projectStore = useProjectStore()
			const recordStore = useRecordStore()
			projectStore.restore()
			recordStore.restore()
			
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
		onShow: function() {
			const accountId = getAccountId()
			if (accountId && getPendingCount(accountId) > 0) {
				syncPendingOps(accountId)
			}
		},
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
