/**
 * 数据库集合常量和类型定义
 */

export const COLLECTIONS = {
  USERS: 'dk-users',
  PROJECTS: 'dk-projects',
  RECORDS: 'dk-records',
}

/**
 * @typedef {Object} DakaUser
 * @property {string} _id
 * @property {string} accountId
 * @property {string} [openid]
 * @property {string} nickname
 * @property {string} avatar
 * @property {string} loginType - wechat / anonymous
 * @property {number} [dataVersion]
 * @property {string} createTime
 * @property {string} updateTime
 */

/**
 * @typedef {Object} DakaProject
 * @property {string} _id
 * @property {string} accountId
 * @property {string} name
 * @property {string} icon
 * @property {string} color
 * @property {string} frequency - daily / weekday / custom
 * @property {number[]} customDays - 0-6
 * @property {boolean} archived
 * @property {number} sortOrder
 * @property {string} createTime
 * @property {string} updateTime
 */

/**
 * @typedef {Object} DakaRecord
 * @property {string} _id
 * @property {string} accountId
 * @property {string} projectId
 * @property {string} date - YYYY-MM-DD
 * @property {string} completedAt
 * @property {boolean} isRetroactive
 * @property {string} createTime
 */
