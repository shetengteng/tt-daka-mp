/**
 * 获取用户所有活跃打卡项目 + 今日打卡状态
 */
import { db, COLLECTIONS, dbCmd } from '@/cloud-emas/database/database'
import { requireAccountId } from '@/utils/auth'
import { formatDate } from '@/utils/date'
import { useProjectStore } from '@/stores/project'
import { useRecordStore } from '@/stores/record'

export async function getProjectList() {
  try {
    const accountId = await requireAccountId()
    const today = formatDate(new Date())

    const projectRes = await db.collection(COLLECTIONS.PROJECTS)
      .where({ accountId, archived: false })
      .orderBy('sortOrder', 'asc')
      .orderBy('createTime', 'desc')
      .get()
    const projects = projectRes.data || []
    if (projects.length === 0) {
      const projectStore = useProjectStore()
      const recordStore = useRecordStore()
      projectStore.setList([])
      recordStore.setTodayRecords([])
      return { success: true, list: [], todayRecords: [] }
    }

    const projectIds = projects.map(p => p._id)
    const recordRes = await db.collection(COLLECTIONS.RECORDS)
      .where({ accountId, date: today, projectId: dbCmd.in(projectIds) })
      .get()
    const todayRecords = recordRes.data || []

    const projectStore = useProjectStore()
    const recordStore = useRecordStore()
    projectStore.setList(projects)
    recordStore.setTodayRecords(todayRecords)

    return { success: true, list: projects, todayRecords }
  } catch (error) {
    console.error('[API] getProjectList 失败:', error)

    const projectStore = useProjectStore()
    const recordStore = useRecordStore()
    if (projectStore.list.length > 0) {
      return {
        success: true,
        list: projectStore.list,
        todayRecords: recordStore.todayRecords,
        fromCache: true,
      }
    }

    return { success: false, list: [], todayRecords: [], error: error.message }
  }
}
