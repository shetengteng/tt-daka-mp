import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import isoWeek from 'dayjs/plugin/isoWeek'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import 'dayjs/locale/zh-cn'

dayjs.extend(weekday)
dayjs.extend(isoWeek)
dayjs.extend(customParseFormat)
dayjs.locale('zh-cn')

export default dayjs
