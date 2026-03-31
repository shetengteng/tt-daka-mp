/**
 * 数据库 CRUD 操作封装
 * @module cloud-emas/database/database
 */

import { getDb, isEmasReady } from './index'
import { mockDb } from '@/mock/db'
import { COLLECTIONS } from './schema'

export const db = {
  collection(name) {
    if (!isEmasReady()) {
      console.warn('[DB] EMAS 未就绪，使用 Mock 数据')
      return mockDb.collection(name)
    }
    const dbInstance = getDb()
    return dbInstance.collection(name)
  }
}

export { COLLECTIONS }
