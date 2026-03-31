/**
 * EMAS 错误处理
 * @module cloud-emas/database/error
 */

/**
 * 检查 EMAS 操作结果
 * @param {Object} res - EMAS 返回结果
 * @param {string} operation - 操作描述
 */
export function checkEmasError(res, operation = '操作') {
  if (!res) {
    throw new Error(`[EMAS] ${operation}返回空结果`)
  }
  if (res.error) {
    throw new Error(`[EMAS] ${operation}失败: ${res.error.message || JSON.stringify(res.error)}`)
  }
}
