/**
 * 获取"我的"页面统计数据
 * 2 次请求：records + projects（客户端分组计数）
 */
import { db, COLLECTIONS } from '@/cloud-emas/database/database'
import { requireAccountId } from '@/utils/auth'

export async function getMineStats() {
  try {
    const accountId = await requireAccountId()

    const [recordRes, projectRes] = await Promise.all([
      db.collection(COLLECTIONS.RECORDS).where({ accountId }).get(),
      db.collection(COLLECTIONS.PROJECTS).where({ accountId }).get(),
    ])

    const records = recordRes.data || []
    const projects = projectRes.data || []

    const totalDays = new Set(records.map(r => r.date)).size
    let activeCount = 0
    let archivedCount = 0
    for (const p of projects) {
      if (p.archived) archivedCount++
      else activeCount++
    }

    return { success: true, totalDays, activeCount, archivedCount }
  } catch (error) {
    console.error('[API] getMineStats 失败:', error)
    return { success: false, totalDays: 0, activeCount: 0, archivedCount: 0, error: error.message }
  }
}
