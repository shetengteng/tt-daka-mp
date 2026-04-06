/**
 * Mock 数据 — 用于 EMAS 未初始化时的本地预览
 */
import { dayjs } from '@/utils/date'

const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
const today = dayjs().format('YYYY-MM-DD')

function daysAgo(n) {
  return dayjs().subtract(n, 'day').format('YYYY-MM-DD')
}

function timeAt(date, h, m) {
  return `${date} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

export const mockProjects = [
  {
    _id: 'proj_001',
    accountId: 'dk_test_user_001',
    name: '运动',
    icon: 'ri-run-line',
    color: '#3B82F6',
    frequency: 'daily',
    customDays: [],
    archived: false,
    sortOrder: 1,
    totalDays: 38,
    createTime: '2026-02-14 08:00:00',
    updateTime: '2026-02-14 08:00:00',
  },
  {
    _id: 'proj_002',
    accountId: 'dk_test_user_001',
    name: '阅读',
    icon: 'ri-book-open-line',
    color: '#22C55E',
    frequency: 'daily',
    customDays: [],
    archived: false,
    sortOrder: 2,
    totalDays: 19,
    createTime: '2026-02-14 08:00:00',
    updateTime: '2026-02-14 08:00:00',
  },
  {
    _id: 'proj_003',
    accountId: 'dk_test_user_001',
    name: '早起',
    icon: 'ri-sun-line',
    color: '#F97316',
    frequency: 'weekday',
    customDays: [],
    archived: false,
    sortOrder: 3,
    totalDays: 15,
    createTime: '2026-03-01 08:00:00',
    updateTime: '2026-03-01 08:00:00',
  },
  {
    _id: 'proj_004',
    accountId: 'dk_test_user_001',
    name: '冥想',
    icon: 'ri-mental-health-line',
    color: '#8B5CF6',
    frequency: 'custom',
    customDays: [1, 3, 5],
    archived: false,
    sortOrder: 4,
    totalDays: 8,
    createTime: '2026-03-10 08:00:00',
    updateTime: '2026-03-10 08:00:00',
  },
  {
    _id: 'proj_005',
    accountId: 'dk_test_user_001',
    name: '喝水',
    icon: 'ri-cup-line',
    color: '#06B6D4',
    frequency: 'daily',
    customDays: [],
    archived: false,
    sortOrder: 5,
    totalDays: 30,
    createTime: '2026-02-20 08:00:00',
    updateTime: '2026-02-20 08:00:00',
  },
  {
    _id: 'proj_006',
    accountId: 'dk_test_user_001',
    name: '写日记',
    icon: 'ri-quill-pen-line',
    color: '#EC4899',
    frequency: 'daily',
    customDays: [],
    archived: false,
    sortOrder: 6,
    totalDays: 18,
    createTime: '2026-03-01 08:00:00',
    updateTime: '2026-03-01 08:00:00',
  },
  {
    _id: 'proj_007',
    accountId: 'dk_test_user_001',
    name: '学英语',
    icon: 'ri-translate-2',
    color: '#EAB308',
    frequency: 'daily',
    customDays: [],
    archived: false,
    sortOrder: 7,
    totalDays: 25,
    createTime: '2026-02-10 08:00:00',
    updateTime: '2026-02-10 08:00:00',
  },
  {
    _id: 'proj_008',
    accountId: 'dk_test_user_001',
    name: '练琴',
    icon: 'ri-music-2-line',
    color: '#14B8A6',
    frequency: 'custom',
    customDays: [2, 4, 6],
    archived: false,
    sortOrder: 8,
    totalDays: 12,
    createTime: '2026-03-15 08:00:00',
    updateTime: '2026-03-15 08:00:00',
  },
  {
    _id: 'proj_archived_001',
    accountId: 'dk_test_user_001',
    name: '晨跑',
    icon: 'ri-footprint-line',
    color: '#06B6D4',
    frequency: 'daily',
    customDays: [],
    archived: true,
    sortOrder: 99,
    createTime: '2026-01-10 08:00:00',
    updateTime: '2026-03-15 10:00:00',
  },
]

function generateRecords() {
  const records = []
  let rid = 1

  for (let i = 0; i < 45; i++) {
    const date = daysAgo(i)
    if (i < 15 || (i >= 17 && i < 39)) {
      records.push({
        _id: `rec_${String(rid++).padStart(3, '0')}`,
        accountId: 'dk_test_user_001',
        projectId: 'proj_001',
        date,
        completedAt: timeAt(date, 9, 15 + (i % 30)),
        isRetroactive: false,
        createTime: timeAt(date, 9, 15 + (i % 30)),
      })
    }
  }

  for (let i = 0; i < 30; i++) {
    const date = daysAgo(i)
    if (i < 7 || (i >= 8 && i < 20)) {
      records.push({
        _id: `rec_${String(rid++).padStart(3, '0')}`,
        accountId: 'dk_test_user_001',
        projectId: 'proj_002',
        date,
        completedAt: timeAt(date, 21, 30 + (i % 20)),
        isRetroactive: false,
        createTime: timeAt(date, 21, 30 + (i % 20)),
      })
    }
  }

  for (let i = 2; i < 25; i++) {
    const date = daysAgo(i)
    const dayOfWeek = dayjs(date).day()
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && i % 3 !== 0) {
      records.push({
        _id: `rec_${String(rid++).padStart(3, '0')}`,
        accountId: 'dk_test_user_001',
        projectId: 'proj_003',
        date,
        completedAt: timeAt(date, 6, 30),
        isRetroactive: false,
        createTime: timeAt(date, 6, 30),
      })
    }
  }

  for (let i = 0; i < 20; i++) {
    const date = daysAgo(i)
    const dayOfWeek = dayjs(date).day()
    if ([1, 3, 5].includes(dayOfWeek) && i % 4 !== 0) {
      records.push({
        _id: `rec_${String(rid++).padStart(3, '0')}`,
        accountId: 'dk_test_user_001',
        projectId: 'proj_004',
        date,
        completedAt: timeAt(date, 7, 0),
        isRetroactive: false,
        createTime: timeAt(date, 7, 0),
      })
    }
  }

  records.push({
    _id: `rec_${String(rid++).padStart(3, '0')}`,
    accountId: 'dk_test_user_001',
    projectId: 'proj_001',
    date: daysAgo(3),
    completedAt: timeAt(daysAgo(3), 10, 0),
    isRetroactive: true,
    createTime: timeAt(daysAgo(1), 20, 0),
  })

  return records
}

export const mockRecords = generateRecords()
