<script>
	import { initEmas } from '@/cloud-emas/database/index'
	
	export default {
		onLaunch: async function() {
			console.log('App Launch')
			
			try {
				await initEmas()
				console.log('[App] EMAS 初始化成功')
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
	@import '@/styles/global.scss';
</style>
