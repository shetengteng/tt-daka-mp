/**
 * 打卡/取消打卡（Local-First）
 * 先写 Store + pending 队列，UI 立即响应，云端异步同步
 */
import { COLLECTIONS } from '@/cloud-emas/database/database'
import { requireAccountId } from '@/utils/auth'
import { formatDate, dayjs } from '@/utils/date'
import { addPendingOp } from '@/utils/pending-ops'
import { useRecordStore } from '@/stores/record'
import { useProjectStore } from '@/stores/project'
import { debouncedSync } from '@/utils/sync-manager'

/**
 * @param {string} projectId
 * @param {boolean} currentChecked - 当前是否已打卡（true=取消, false=打卡）
 */
export async function toggleDaka(projectId, currentChecked) {
  try {
    const accountId = await requireAccountId()
    const today = formatDate(new Date())
    const recordStore = useRecordStore()
    const projectStore = useProjectStore()

    if (currentChecked) {
      recordStore.removeTodayRecord(projectId)

      const remaining = addPendingOp(accountId, {
        op: 'remove',
        collection: COLLECTIONS.RECORDS,
        where: { accountId, projectId, date: today },
        data: { projectId, date: today },
      })
      recordStore.pendingCount = remaining

      projectStore.markDirty()
      if (remaining > 0) debouncedSync()
      return { success: true, action: 'cancel' }
    }

    const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
    const record = {
      accountId,
      projectId,
      date: today,
      completedAt: now,
      isRetroactive: false,
      createTime: now,
      _id: `local_${Date.now()}`,
    }

    recordStore.addTodayRecord(record)

    const remaining = addPendingOp(accountId, {
      op: 'add',
      collection: COLLECTIONS.RECORDS,
      data: record,
    })
    recordStore.pendingCount = remaining

    projectStore.markDirty()
    if (remaining > 0) debouncedSync()
    return { success: true, action: 'check', record }
  } catch (error) {
    console.error('[API] toggleDaka 失败:', error)
    return { success: false, error: error.message }
  }
}
