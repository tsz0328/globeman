// 列表按 createTime 降序排序工具
// 统一用于所有带"创建时间"列的列表（用户/客户/项目/订单等）
// 行为：最新创建的排在最前面；兼容 MySQL DATETIME 的 "YYYY-MM-DD HH:MM:SS" 空格格式；
// 时间无法解析时兜底为 0（排末尾）；时间相同时用 id 兜底（大的在前）

export interface HasCreateTime {
  createTime?: string
  id: number
}

export const toTimeStamp = (raw: unknown): number => {
  if (!raw || typeof raw !== 'string') return 0
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(raw)
    ? raw.replace(' ', 'T')
    : raw
  const t = new Date(normalized).getTime()
  return Number.isNaN(t) ? 0 : t
}

// 按 createTime 降序（最新在前）
export const sortByCreateTimeDesc = <T extends HasCreateTime>(list: T[]): T[] => {
  return [...list].sort((a, b) => {
    const ta = toTimeStamp(a.createTime)
    const tb = toTimeStamp(b.createTime)
    if (ta !== tb) return tb - ta
    return b.id - a.id
  })
}
