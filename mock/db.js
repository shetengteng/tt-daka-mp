/**
 * Mock 数据库 — 模拟 CloudBase 风格 API
 * 支持 where/doc/orderBy/skip/limit/get/count/add/update/remove 链式调用
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
  let _where = {}
  let _docId = null
  let _orderBy = []
  let _skip = 0
  let _limit = 0

  const chain = {
    where(condition) {
      _where = condition
      return chain
    },

    doc(id) {
      _docId = id
      return chain
    },

    orderBy(field, order = 'asc') {
      _orderBy.push({ field, order })
      return chain
    },

    skip(n) {
      _skip = n
      return chain
    },

    limit(n) {
      _limit = n
      return chain
    },

    field() {
      return chain
    },

    async get() {
      if (_docId) {
        const item = data.find(doc => doc._id === _docId)
        return { data: item ? [deepClone(item)] : [], errMsg: 'ok' }
      }

      let result = data.filter(doc => matchQuery(doc, _where))

      if (_orderBy.length > 0) {
        result.sort((a, b) => {
          for (const { field, order } of _orderBy) {
            const dir = order === 'desc' ? -1 : 1
            if (a[field] < b[field]) return -1 * dir
            if (a[field] > b[field]) return 1 * dir
          }
          return 0
        })
      }

      if (_skip > 0) result = result.slice(_skip)
      if (_limit > 0) result = result.slice(0, _limit)

      return { data: deepClone(result), errMsg: 'ok' }
    },

    async count() {
      const filtered = data.filter(doc => matchQuery(doc, _where))
      return { total: filtered.length, errMsg: 'ok' }
    },

    async add(doc) {
      const newDoc = deepClone(doc)
      if (!newDoc._id) {
        newDoc._id = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      }
      data.push(newDoc)
      return { id: newDoc._id, _id: newDoc._id, errMsg: 'ok' }
    },

    async update(updateData) {
      if (_docId) {
        const idx = data.findIndex(doc => doc._id === _docId)
        if (idx < 0) return { updated: 0, errMsg: 'ok' }
        Object.assign(data[idx], updateData)
        return { updated: 1, errMsg: 'ok' }
      }

      let count = 0
      for (const doc of data) {
        if (matchQuery(doc, _where)) {
          Object.assign(doc, updateData)
          count++
        }
      }
      return { updated: count, errMsg: 'ok' }
    },

    async remove() {
      if (_docId) {
        const idx = data.findIndex(doc => doc._id === _docId)
        if (idx < 0) return { deleted: 0, errMsg: 'ok' }
        data.splice(idx, 1)
        return { deleted: 1, errMsg: 'ok' }
      }

      let count = 0
      for (let i = data.length - 1; i >= 0; i--) {
        if (matchQuery(data[i], _where)) {
          data.splice(i, 1)
          count++
        }
      }
      return { deleted: count, errMsg: 'ok' }
    },
  }

  return chain
}

export const mockDb = {
  collection(name) {
    return createChain(name)
  },
}
