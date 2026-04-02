/**
 * EMAS 数据库操作封装（CloudBase 风格）
 * 
 * 将 EMAS SDK 的 MongoDB 风格 API 封装成 CloudBase 链式调用风格
 * 与 tt-paikebao-mp 保持一致
 * 
 * 使用方式：
 *   import { db } from '@/cloud-emas/database/database'
 *   
 *   const res = await db.collection('xxx').where({ accountId }).get()
 *   const addRes = await db.collection('xxx').add({ name: '张三' })
 *   await db.collection('xxx').doc(id).update({ name: '李四' })
 *   await db.collection('xxx').doc(id).remove()
 * 
 * @module cloud-emas/database/database
 */

import { getDb, initEmas } from './index'
import { mockDb } from '@/mock/db'
import { DEV_MODE } from '@/config/index'
import { COLLECTIONS } from './schema'

export const dbCmd = {
  eq: (val) => val,
  neq: (val) => ({ $ne: val }),
  lt: (val) => ({ $lt: val }),
  lte: (val) => ({ $lte: val }),
  gt: (val) => ({ $gt: val }),
  gte: (val) => ({ $gte: val }),
  in: (arr) => ({ $in: arr }),
  nin: (arr) => ({ $nin: arr }),
  and: (conditions) => ({ $and: conditions }),
  or: (conditions) => ({ $or: conditions }),
  exists: (bool) => ({ $exists: bool }),
}

export const command = dbCmd

class CollectionReference {
  constructor(collectionName) {
    this._collectionName = collectionName
    this._where = {}
    this._docId = null
    this._skip = 0
    this._limit = 1000
    this._orderBy = []
  }

  async _getCollection() {
    await initEmas()
    const emasDb = getDb()
    if (!emasDb) throw new Error('EMAS 数据库未初始化')
    return emasDb.collection(this._collectionName)
  }

  doc(id) {
    this._docId = id
    return this
  }

  where(condition) {
    this._where = condition
    return this
  }

  skip(n) {
    this._skip = n
    return this
  }

  limit(n) {
    this._limit = n
    return this
  }

  orderBy(field, order = 'asc') {
    this._orderBy.push({ field, order })
    return this
  }

  _buildSort() {
    if (this._orderBy.length === 0) return undefined
    const sort = {}
    for (const item of this._orderBy) {
      sort[item.field] = item.order === 'desc' ? -1 : 1
    }
    return sort
  }

  async get() {
    const collection = await this._getCollection()

    if (this._docId) {
      const res = await collection.findOne({ _id: this._docId })
      const doc = res.result
      return { data: doc ? [doc] : [], errMsg: 'ok' }
    }

    const options = { skip: this._skip, limit: this._limit }
    const sort = this._buildSort()
    if (sort) options.sort = sort

    const res = await collection.find(this._where, options)
    return { data: res.result || [], errMsg: 'ok' }
  }

  async getAll() {
    const MAX_LIMIT = 1000
    let allData = []
    let skip = 0
    let hasMore = true

    while (hasMore) {
      this._skip = skip
      this._limit = MAX_LIMIT
      const res = await this.get()
      const data = res.data || []
      allData = allData.concat(data)
      if (data.length < MAX_LIMIT) {
        hasMore = false
      } else {
        skip += MAX_LIMIT
      }
    }

    return { data: allData, total: allData.length, errMsg: 'ok' }
  }

  async count() {
    const collection = await this._getCollection()
    const res = await collection.count(this._where)
    return { total: res.result || 0, errMsg: 'ok' }
  }

  async add(data) {
    const collection = await this._getCollection()
    const res = await collection.insertOne(data)
    return {
      id: res.result?.insertedId,
      _id: res.result?.insertedId,
      errMsg: 'ok'
    }
  }

  async update(data) {
    const collection = await this._getCollection()
    const updateDoc = { $set: data }

    if (this._docId) {
      const res = await collection.updateOne({ _id: this._docId }, updateDoc)
      return { updated: res.result?.modifiedCount || 0, errMsg: 'ok' }
    }

    const res = await collection.updateMany(this._where, updateDoc)
    return { updated: res.result?.modifiedCount || 0, errMsg: 'ok' }
  }

  async remove() {
    const collection = await this._getCollection()

    if (this._docId) {
      const res = await collection.deleteOne({ _id: this._docId })
      return { deleted: res.result?.deletedCount || 0, errMsg: 'ok' }
    }

    const res = await collection.deleteMany(this._where)
    return { deleted: res.result?.deletedCount || 0, errMsg: 'ok' }
  }
}

export const db = {
  collection(name) {
    if (DEV_MODE) {
      return mockDb.collection(name)
    }
    return new CollectionReference(name)
  },
  command: dbCmd
}

export { COLLECTIONS }
