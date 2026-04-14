var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { handleEmasError } from "./error";
const dbCmd = {
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
  exists: (bool) => ({ $exists: bool })
};
const command = dbCmd;
class CollectionReference {
  constructor(collectionName, emas) {
    __publicField(this, "_collectionName");
    __publicField(this, "_emas");
    __publicField(this, "_where", {});
    __publicField(this, "_docId", null);
    __publicField(this, "_skip", 0);
    __publicField(this, "_limit", 1e3);
    __publicField(this, "_orderBy", []);
    __publicField(this, "_projection", null);
    this._collectionName = collectionName;
    this._emas = emas;
  }
  async _getCollection() {
    await this._emas.init();
    const emasDb = this._emas.getDb();
    if (!emasDb) throw new Error("EMAS 数据库未初始化");
    return emasDb.collection(this._collectionName);
  }
  doc(id) {
    this._docId = id;
    return this;
  }
  where(condition) {
    this._where = condition;
    return this;
  }
  skip(n) {
    this._skip = n;
    return this;
  }
  limit(n) {
    this._limit = n;
    return this;
  }
  orderBy(field, order = "asc") {
    this._orderBy.push({ field, order });
    return this;
  }
  field(projection) {
    this._projection = projection;
    return this;
  }
  _buildSort() {
    if (this._orderBy.length === 0) return void 0;
    const sort = {};
    for (const item of this._orderBy) {
      sort[item.field] = item.order === "desc" ? -1 : 1;
    }
    return sort;
  }
  async get() {
    try {
      const collection = await this._getCollection();
      if (this._docId) {
        const findOneOpts = {};
        if (this._projection) findOneOpts.projection = this._projection;
        const res2 = await collection.findOne({ _id: this._docId }, findOneOpts);
        const doc = res2.result;
        return { data: doc ? [doc] : [], errMsg: "ok" };
      }
      const options = { skip: this._skip, limit: this._limit };
      const sort = this._buildSort();
      if (sort) options.sort = sort;
      if (this._projection) options.projection = this._projection;
      const res = await collection.find(this._where, options);
      return { data: res.result || [], errMsg: "ok" };
    } catch (e) {
      handleEmasError(e, `查询 ${this._collectionName}`);
    }
  }
  async getAll() {
    const MAX_LIMIT = 1e3;
    let allData = [];
    let skip = 0;
    let hasMore = true;
    while (hasMore) {
      this._skip = skip;
      this._limit = MAX_LIMIT;
      const res = await this.get();
      const data = res?.data || [];
      allData = allData.concat(data);
      if (data.length < MAX_LIMIT) {
        hasMore = false;
      } else {
        skip += MAX_LIMIT;
      }
    }
    return { data: allData, total: allData.length, errMsg: "ok" };
  }
  async count() {
    try {
      const collection = await this._getCollection();
      const res = await collection.count(this._where);
      return { total: res.result || 0, errMsg: "ok" };
    } catch (e) {
      handleEmasError(e, `统计 ${this._collectionName}`);
    }
  }
  async add(data) {
    try {
      const collection = await this._getCollection();
      const res = await collection.insertOne(data);
      return {
        id: res.result?.insertedId,
        _id: res.result?.insertedId,
        errMsg: "ok"
      };
    } catch (e) {
      handleEmasError(e, `新增 ${this._collectionName}`);
    }
  }
  async addBatch(dataList) {
    try {
      const collection = await this._getCollection();
      const res = await collection.insertMany(dataList);
      return {
        count: res.result ? Object.keys(res.result).length : 0,
        ids: res.result || {},
        errMsg: "ok"
      };
    } catch (e) {
      handleEmasError(e, `批量新增 ${this._collectionName}`);
    }
  }
  async update(data) {
    try {
      const collection = await this._getCollection();
      const updateDoc = { $set: data };
      if (this._docId) {
        const res2 = await collection.updateOne({ _id: this._docId }, updateDoc);
        return { updated: res2.result?.modifiedCount || 0, errMsg: "ok" };
      }
      const res = await collection.updateMany(this._where, updateDoc);
      return { updated: res.result?.modifiedCount || 0, errMsg: "ok" };
    } catch (e) {
      handleEmasError(e, `更新 ${this._collectionName}`);
    }
  }
  async remove() {
    try {
      const collection = await this._getCollection();
      if (this._docId) {
        const res2 = await collection.deleteOne({ _id: this._docId });
        return { deleted: res2.result?.deletedCount || 0, errMsg: "ok" };
      }
      const res = await collection.deleteMany(this._where);
      return { deleted: res.result?.deletedCount || 0, errMsg: "ok" };
    } catch (e) {
      handleEmasError(e, `删除 ${this._collectionName}`);
    }
  }
}
function createEmasDb(emas, mockDb) {
  const db = {
    collection(name) {
      if (mockDb) return mockDb.collection(name);
      return new CollectionReference(name, emas);
    },
    command: dbCmd
  };
  return { db, dbCmd, command: dbCmd };
}
export {
  command,
  createEmasDb,
  dbCmd
};
