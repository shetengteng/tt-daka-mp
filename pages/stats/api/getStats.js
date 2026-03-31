/**
 * 获取统计数据
 */
import { db, COLLECTIONS } from '@/cloud-emas/database/database'
import { checkEmasError } from '@/cloud-emas/database/error'
import { requireAccountId } from '@/utils/auth'
import { dayjs, formatDate, getDateRange } from '@/utils/date'

export async function getStats() {
  try {
    const accountId = await requireAccountId()
    
    const projectRes = await db.collection(COLLECTIONS.PROJECTS)
      .find({ accountId, archived: false })
      .exec()
    checkEmasError(projectRes, '查询项目')
    const projects = projectRes.result || []
    
    const recordRes = await db.collection(COLLECTIONS.RECORDS)
      .find({ accountId })
      .sort({ date: -1 })
      .exec()
    checkEmasError(recordRes, '查询记录')
    const allRecords = recordRes.result || []
    
    const today = formatDate(new Date())
    const { startDate: monthStart, endDate: monthEnd } = getDateRange(new Date(), 'month')
    
    const dateSet = new Set(allRecords.map(r => r.date))
    const totalDays = dateSet.size
    
    const { currentStreak, longestStreak } = calcStreaks(dateSet, today)
    
    const weekData = calcWeekData(allRecords, projects)
    
    const projectStats = projects.map(p => {
      const pRecords = allRecords.filter(r => r.projectId === p._id)
      const pDateSet = new Set(pRecords.map(r => r.date))
      const monthRecords = pRecords.filter(r => r.date >= monthStart && r.date <= monthEnd)
      const daysInMonth = dayjs().daysInMonth()
      const daysPassed = Math.min(parseInt(dayjs().format('D')), daysInMonth)
      
      const { currentStreak: pStreak, longestStreak: pLongest } = calcStreaks(pDateSet, today)
      const last7 = calcLast7Days(pDateSet)
      
      return {
        project: p,
        totalDays: pDateSet.size,
        monthDone: monthRecords.length,
        monthTotal: daysPassed,
        completionRate: daysPassed > 0 ? Math.round((monthRecords.length / daysPassed) * 100) : 0,
        currentStreak: pStreak,
        longestStreak: pLongest,
        last7,
      }
    })
    
    return {
      success: true,
      data: { totalDays, currentStreak, longestStreak, weekData, projectStats }
    }
  } catch (error) {
    console.error('[API] getStats 失败:', error)
    return { success: false, error: error.message }
  }
}

function calcStreaks(dateSet, today) {
  let currentStreak = 0
  let longestStreak = 0
  let streak = 0
  let d = dayjs(today)
  
  for (let i = 0; i < 365; i++) {
    const dateStr = d.format('YYYY-MM-DD')
    if (dateSet.has(dateStr)) {
      streak++
      if (i <= currentStreak) currentStreak = streak
      longestStreak = Math.max(longestStreak, streak)
    } else {
      if (i === 0) {
        // today not checked, still count from yesterday
      } else {
        streak = 0
      }
    }
    d = d.subtract(1, 'day')
  }
  
  return { currentStreak, longestStreak }
}

function calcWeekData(records, projects) {
  const weekStart = dayjs().startOf('isoWeek')
  const result = []
  
  for (let i = 0; i < 7; i++) {
    const d = weekStart.add(i, 'day')
    const dateStr = d.format('YYYY-MM-DD')
    const today = formatDate(new Date())
    
    if (dateStr > today) {
      result.push({ date: dateStr, label: d.format('ddd'), percent: -1 })
      continue
    }
    
    const dayRecords = records.filter(r => r.date === dateStr)
    const total = projects.length
    const done = new Set(dayRecords.map(r => r.projectId)).size
    const percent = total > 0 ? Math.round((done / total) * 100) : 0
    
    result.push({ date: dateStr, label: d.format('ddd'), percent, done, total })
  }
  
  return result
}

function calcLast7Days(dateSet) {
  const result = []
  for (let i = 6; i >= 0; i--) {
    const dateStr = dayjs().subtract(i, 'day').format('YYYY-MM-DD')
    result.push(dateSet.has(dateStr))
  }
  return result
}
