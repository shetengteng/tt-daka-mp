import { describe, it, expect } from 'vitest'
import {
  formatDate, formatDateTime, formatMonth,
  getMonthLabel, isToday, formatRelativeDate, getDateRange,
} from '@/utils/date'

describe('formatDate', () => {
  it('formats Date object to YYYY-MM-DD', () => {
    expect(formatDate(new Date('2026-04-05T12:00:00'))).toBe('2026-04-05')
  })

  it('formats date string', () => {
    expect(formatDate('2026-01-15')).toBe('2026-01-15')
  })

  it('returns empty string for falsy input', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
    expect(formatDate('')).toBe('')
  })
})

describe('formatDateTime', () => {
  it('formats to YYYY-MM-DD HH:mm', () => {
    expect(formatDateTime('2026-04-05T14:30:00')).toBe('2026-04-05 14:30')
  })

  it('returns empty for falsy input', () => {
    expect(formatDateTime(null)).toBe('')
  })
})

describe('formatMonth', () => {
  it('formats to YYYY-MM', () => {
    expect(formatMonth('2026-04-05')).toBe('2026-04')
  })

  it('returns empty for falsy input', () => {
    expect(formatMonth(null)).toBe('')
  })
})

describe('getMonthLabel', () => {
  it('formats to Chinese year-month', () => {
    expect(getMonthLabel('2026-04-05')).toBe('2026年4月')
  })

  it('returns empty for falsy input', () => {
    expect(getMonthLabel(null)).toBe('')
  })
})

describe('isToday', () => {
  it('returns true for today', () => {
    expect(isToday(new Date())).toBe(true)
  })

  it('returns false for yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(isToday(yesterday)).toBe(false)
  })

  it('returns false for falsy input', () => {
    expect(isToday(null)).toBe(false)
  })
})

describe('formatRelativeDate', () => {
  it('returns 今天 for today', () => {
    expect(formatRelativeDate(new Date())).toBe('今天')
  })

  it('returns 昨天 for yesterday', () => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    expect(formatRelativeDate(d)).toBe('昨天')
  })

  it('returns 明天 for tomorrow', () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    expect(formatRelativeDate(d)).toBe('明天')
  })

  it('returns M月D日 for other dates', () => {
    const result = formatRelativeDate('2025-01-15')
    expect(result).toBe('1月15日')
  })

  it('returns empty for falsy input', () => {
    expect(formatRelativeDate(null)).toBe('')
  })
})

describe('getDateRange', () => {
  it('returns month start and end', () => {
    const range = getDateRange('2026-04-15', 'month')
    expect(range.startDate).toBe('2026-04-01')
    expect(range.endDate).toBe('2026-04-30')
  })

  it('returns week start and end', () => {
    const range = getDateRange('2026-04-08', 'week')
    expect(range.startDate).toBeTruthy()
    expect(range.endDate).toBeTruthy()
  })

  it('returns empty for falsy input', () => {
    const range = getDateRange(null)
    expect(range.startDate).toBe('')
    expect(range.endDate).toBe('')
  })
})
