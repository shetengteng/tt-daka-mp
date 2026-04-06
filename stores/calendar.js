import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { dayjs, formatDate } from '@/utils/date'

export const useCalendarStore = defineStore('calendar', () => {
  const currentMonth = ref(dayjs().format('YYYY-MM'))
  const selectedDate = ref(formatDate(new Date()))
  const records = ref([])
  const projects = ref([])
  const calendarData = ref({})

  const activeProjects = computed(() => projects.value.filter(p => !p.archived))

  function setMonthData(list, projectList) {
    records.value = list
    projects.value = projectList
    buildCalendarData()
  }

  function setSelectedDate(date) {
    selectedDate.value = date
  }

  function setCurrentMonth(month) {
    currentMonth.value = month
  }

  function buildCalendarData() {
    const data = {}
    const total = activeProjects.value.length
    records.value.forEach(r => {
      if (!data[r.date]) data[r.date] = { done: 0, total }
      data[r.date].done++
    })
    calendarData.value = data
  }

  return {
    currentMonth, selectedDate, records, projects, calendarData, activeProjects,
    setMonthData, setSelectedDate, setCurrentMonth,
  }
})
