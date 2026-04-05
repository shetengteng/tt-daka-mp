import { describe, it, expect } from 'vitest'
import { isLocalFile } from '@/utils/file'

describe('isLocalFile', () => {
  it('detects wxfile:// paths', () => {
    expect(isLocalFile('wxfile://tmp_abc123.jpg')).toBe(true)
  })

  it('detects http://tmp paths', () => {
    expect(isLocalFile('http://tmp/image.png')).toBe(true)
  })

  it('detects blob: paths', () => {
    expect(isLocalFile('blob:http://localhost/abc')).toBe(true)
  })

  it('detects /tmp paths', () => {
    expect(isLocalFile('/tmp/upload/img.jpg')).toBe(true)
  })

  it('returns false for https URLs', () => {
    expect(isLocalFile('https://example.com/img.jpg')).toBe(false)
  })

  it('returns false for base64 data URIs', () => {
    expect(isLocalFile('data:image/png;base64,abc')).toBe(false)
  })

  it('returns false for empty/null', () => {
    expect(isLocalFile('')).toBe(false)
    expect(isLocalFile(null)).toBe(false)
    expect(isLocalFile(undefined)).toBe(false)
  })
})
