<script>
	import { initEmas } from '@/cloud-emas/database/index'
	import { anonymousAuth } from '@/cloud-emas/database/api/anonymousAuth'
	import { useThemeStore } from '@/stores/theme'
	import { DEV_MODE } from '@/config/index'
	import { setAccountId } from '@/utils/auth'
	
	export default {
		onLaunch: async function() {
			console.log('App Launch')
			
			const themeStore = useThemeStore()
			themeStore.applyTheme()
			
			if (DEV_MODE) {
				setAccountId('mock_user')
				console.log('[App] 开发模式，使用 mock 数据')
				return
			}
			
			try {
				await initEmas()
				console.log('[App] EMAS 初始化成功')
				
				const authRes = await anonymousAuth()
				if (authRes.success) {
					console.log('[App] 匿名授权成功')
					const { getMpServerless } = await import('@/cloud-emas/database/index')
					const mp = getMpServerless()
					const userInfo = await mp.user.getInfo()
					const userId = userInfo?.result?.user?.userId || userInfo?.result?.userId
					if (userId) {
						setAccountId(userId)
						uni.setStorageSync('dk_account_id', userId)
						console.log('[App] accountId 设置为 EMAS userId:', userId)
					}
				} else {
					console.error('[App] 匿名授权失败:', authRes.error)
				}
			} catch (error) {
				console.error('[App] EMAS 初始化失败:', error)
			}
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	@import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');
	@import '@/styles/global.scss';
</style>
