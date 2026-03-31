/**
 * 路由管理
 */

export const routes = {
  home: '/pages/index/index',
  calendar: '/pages/calendar/index',
  stats: '/pages/stats/index',
  mine: '/pages/mine/index',
  projectManage: '/pages/project/index',
  projectAdd: '/pages/project/sub/add/index',
  projectDetail: '/pages/project/sub/detail/index',
  projectArchived: '/pages/project/sub/archived/index',
}

export function goToProjectAdd() {
  uni.navigateTo({ url: routes.projectAdd })
}

export function goToProjectEdit(id) {
  uni.navigateTo({ url: `${routes.projectAdd}?id=${id}` })
}

export function goToProjectDetail(id) {
  uni.navigateTo({ url: `${routes.projectDetail}?id=${id}` })
}

export function goToProjectManage() {
  uni.navigateTo({ url: routes.projectManage })
}

export function goToProjectArchived() {
  uni.navigateTo({ url: routes.projectArchived })
}

export function switchTab(pageName) {
  const url = routes[pageName]
  if (url) {
    uni.reLaunch({ url })
  }
}

export function goBack() {
  uni.navigateBack()
}
