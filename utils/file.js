/**
 * 文件处理工具
 */

const AVATAR_MAX_SIZE = 200
const AVATAR_QUALITY = 80

export function isLocalFile(path) {
  if (!path) return false
  return path.startsWith('wxfile://') || path.startsWith('http://tmp') ||
         path.startsWith('blob:') || path.startsWith('/tmp')
}

export function compressImage(filePath) {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    uni.compressImage({
      src: filePath,
      quality: AVATAR_QUALITY,
      compressedWidth: AVATAR_MAX_SIZE,
      success: (res) => resolve(res.tempFilePath),
      fail: () => resolve(filePath),
    })
    // #endif
    // #ifdef H5
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let w = img.width
      let h = img.height
      if (w > AVATAR_MAX_SIZE || h > AVATAR_MAX_SIZE) {
        const ratio = Math.min(AVATAR_MAX_SIZE / w, AVATAR_MAX_SIZE / h)
        w = Math.round(w * ratio)
        h = Math.round(h * ratio)
      }
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', AVATAR_QUALITY / 100))
    }
    img.onerror = () => resolve(filePath)
    img.src = filePath
    // #endif
  })
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
    resolve(filePath)
    // #endif
  })
}
