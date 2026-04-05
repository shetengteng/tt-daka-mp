/**
 * 文件处理工具
 */

export function isLocalFile(path) {
  if (!path) return false
  return path.startsWith('wxfile://') || path.startsWith('http://tmp') ||
         path.startsWith('blob:') || path.startsWith('/tmp')
}

export function fileToBase64(filePath) {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    const fs = uni.getFileSystemManager()
    fs.readFile({
      filePath,
      encoding: 'base64',
      success: (res) => {
        const ext = filePath.split('.').pop()?.toLowerCase() || 'jpeg'
        const mime = ext === 'png' ? 'image/png' : 'image/jpeg'
        resolve(`data:${mime};base64,${res.data}`)
      },
      fail: reject,
    })
    // #endif
    // #ifdef H5
    uni.request({
      url: filePath,
      responseType: 'arraybuffer',
      success: (res) => {
        const base64 = uni.arrayBufferToBase64(res.data)
        resolve(`data:image/jpeg;base64,${base64}`)
      },
      fail: reject,
    })
    // #endif
  })
}
