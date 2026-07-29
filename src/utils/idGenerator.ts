import { pinyin } from 'pinyin-pro'

/**
 * 生成业务 id：2位类型首字母 + 17位时间(YYYYMMDDHHmmssSSS 毫秒) + 5位随机字母数字
 * 例：维修 → WX20260729160351280AB3C9
 * - 类型首字母：中文类型取每字拼音首字母取前 2 位；例 维修→WX、销售→XS、采购→CG、维修项目→WX
 * - 英文/数字类型取前 2 字符大写；无类型兜底 XX
 */
export function generateTypedId(type: string): string {
  const typeStr = (type || '').trim()
  let typePrefix = ''
  if (typeStr) {
    if (/[一-龥]/.test(typeStr)) {
      typePrefix = pinyin(typeStr, { pattern: 'first', toneType: 'none' })
        .replace(/\s/g, '')
        .slice(0, 2)
        .toUpperCase()
    } else {
      // 非中文：直接取前两个字符
      typePrefix = typeStr.slice(0, 2).toUpperCase()
    }
  } else {
    typePrefix = 'XX'
  }

  const now = new Date()
  const pad = (n: number, len = 2) => String(n).padStart(len, '0')
  const timePart =
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}${pad(now.getMilliseconds(), 3)}`

  const RANDOM_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let randomSuffix = ''
  for (let i = 0; i < 5; i++) {
    randomSuffix += RANDOM_CHARS.charAt(Math.floor(Math.random() * RANDOM_CHARS.length))
  }

  return `${typePrefix}${timePart}${randomSuffix}`
}
