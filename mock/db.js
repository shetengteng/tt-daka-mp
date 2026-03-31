/**
 * Mock 数据库 — 模拟 EMAS collection API
 * 支持 find/findOne/insertOne/updateOne/deleteOne/deleteMany/count + sort/exec 链式调用
 */
import { mockProjects, mockRecords } from './data'

const store = {
  'dk-projects': [...mockProjects],
  'dk-records': [...mockRecords],
  'dk-users': [],
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function matchQuery(doc, query) {
  for (const key of Object.keys(query)) {
    const condition = query[key]
    const value = doc[key]

    if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
      if ('$in' in condition) {
        if (!condition.$in.includes(value)) return false
      }
      if ('$gte' in condition) {
        if (value < condition.$gte) return false
      }
      if ('$lte' in condition) {
        if (value > condition.$lte) return false
      }
      if ('$ne' in condition) {
        if (value === condition.$ne) return false
      }
      continue
    }

    if (value !== condition) return false
  }
  return true
}

function createChain(collectionName) {
  const data = store[collectionName] || []
  let _query = {}
  let _sort = null
  let _limit = 0

  const chain = {
    find(query = {}) {
      _query = query
      return chain
    },

    findOne(query = {}) {
      const item = data.find(doc => matchQuery(doc, query))
      return { result: item ? deepClone(item) : null }
    },

    sort(sortObj) {
      _sort = sortObj
      return chain
    },

    limit(n) {
      _limit = n
      return chain
    },

    count() {
      const filtered = data.filter(doc => matchQuery(doc, _query))
      return { result: filtered.length }
    },

    exec() {
      let result = data.filter(doc => matchQuery(doc, _query))

      if (_sort) {
        const sortKey = Object.keys(_sort)[0]
        const sortDir = _sort[sortKey]
        result.sort((a, b) => {
          if (a[sortKey] < b[sortKey]) return -1 * sortDir
          if (a[sortKey] > b[sortKey]) return 1 * sortDir
          return 0
        })
      }

      if (_limit > 0) {
        result = result.slice(0, _limit)
      }

      return { result: deepClone(result) }
    },

    insertOne(doc) {
      const newDoc = deepClone(doc)
      if (!newDoc._id) {
        newDoc._id = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      }
      data.push(newDoc)
      return { result: { _id: newDoc._id, insertedId: newDoc._id } }
    },

    updateOne(query, update) {
      const idx = data.findIndex(doc => matchQuery(doc, query))
      if (idx < 0) return { result: { modifiedCount: 0 } }

      if (update.$set) {
        Object.assign(data[idx], update.$set)
      }
      return { result: { modifiedCount: 1 } }
    },

    deleteOne(query) {
      const idx = data.findIndex(doc => matchQuery(doc, query))
      if (idx < 0) return { result: { deletedCount: 0 } }
      data.splice(idx, 1)
      return { result: { deletedCount: 1 } }
    },

    deleteMany(query) {
      let count = 0
      for (let i = data.length - 1; i >= 0; i--) {
        if (matchQuery(data[i], query)) {
          data.splice(i, 1)
          count++
        }
      }
      return { result: { deletedCount: count } }
    },
  }

  return chain
}

export const mockDb = {
  collection(name) {
    return createChain(name)
  },
}
