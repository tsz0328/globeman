// 列表按 createTime 降序排序工具
// 统一用于所有带"创建时间"列的列表（用户/客户/项目/订单等）
// 行为：最新创建的排在最前面；兼容 MySQL DATETIME 的 "YYYY-MM-DD HH:MM:SS" 空格格式；
// 时间无法解析时兜底为 0（排末尾）；时间相同时用 id 兜底（大的在前）

export interface HasCreateTime {
  createTime?: string
  id: number | string
}

export const toTimeStamp = (raw: unknown): number => {
  // Date 实例直接取毫秒
  if (raw instanceof Date) {
    const t = raw.getTime()
    return Number.isNaN(t) ? 0 : t
  }
  // 数字时间戳（秒/毫秒）直接兼容
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw < 1e12 ? raw * 1000 : raw
  }
  if (!raw || typeof raw !== 'string') return 0
  // 纯数字字符串按时间戳处理（10位=秒，13位=毫秒）
  if (/^\d{10,13}$/.test(raw)) {
    const n = Number(raw)
    return raw.length === 10 ? n * 1000 : n
  }
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(raw)
    ? raw.replace(' ', 'T')
    : raw
  const t = new Date(normalized).getTime()
  return Number.isNaN(t) ? 0 : t
}

// 统一时间显示格式：任何后端时间（ISO "2026-05-29T11:44:53"、"YYYY-MM-DD HH:mm:ss"、时间戳）
// → "YYYY-MM-DD HH:mm:ss"。无法解析时原样返回（空值返回 ''），保证表格里不出现 "T" 或时间戳数字
export const formatDateTime = (raw: unknown): string => {
  if (raw == null || raw === '') return ''
  const t = toTimeStamp(raw)
  if (t === 0) return typeof raw === 'string' ? raw : ''
  const d = new Date(t)
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  )
}

// 按 createTime 降序（最新在前）
export const sortByCreateTimeDesc = <T extends HasCreateTime>(list: T[]): T[] => {
  return [...list].sort((a, b) => {
    const ta = toTimeStamp(a.createTime)
    const tb = toTimeStamp(b.createTime)
    if (ta !== tb) return tb - ta
    // id 兜底：兼容 number 与 string（如项目 id 为字母前缀+时间戳的字符串）
    const na = typeof a.id === 'number' ? a.id : Number(a.id)
    const nb = typeof b.id === 'number' ? b.id : Number(b.id)
    if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) return nb - na
    return String(b.id).localeCompare(String(a.id))
  })
}
