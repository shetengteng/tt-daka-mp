/**
 * 日期工具类
 */
import dayjs from '@/plugins/dayjs'

export function formatDate(date) {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD')
}

export function formatDateTime(date) {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

export function formatMonth(date) {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM')
}

export function getMonthLabel(date) {
  if (!date) return ''
  return dayjs(date).format('YYYY年M月')
}

export function isToday(date) {
  if (!date) return false
  return dayjs(date).isSame(dayjs(), 'day')
}

export function formatRelativeDate(date) {
  if (!date) return ''
  const d = dayjs(date)
  const today = dayjs().startOf('day')
  const diff = d.startOf('day').diff(today, 'day')
  if (diff === 0) return '今天'
  if (diff === -1) return '昨天'
  if (diff === 1) return '明天'
  return d.format('M月D日')
}

export function getDateRange(date, unit = 'month') {
  if (!date) return { startDate: '', endDate: '' }
  const d = dayjs(date)
  return {
    startDate: d.startOf(unit).format('YYYY-MM-DD'),
    endDate: d.endOf(unit).format('YYYY-MM-DD')
  }
}

export { dayjs }
