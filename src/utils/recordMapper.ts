// ============================================================================
// 通用「后端记录 → 前端结构」归一化原语
// ----------------------------------------------------------------------------
// 后端接口返回结构不稳定：同一批列表可能是 数组 / 单个对象 / 嵌套对象 /
// null，字段命名也可能混用（如 name/username/account、id/userId…）。
// 各业务 composable（useUser / useCustomer / useProject…）曾各自内联一套
// normalizeRecords + getString，这里抽出共享版本，避免重复。
//
// 设计约定：本文件只提供「通用原语」，不掺任何业务字段名。
// 业务字段的挑选策略仍由各 composable 的 mapXxx(record) 负责，
// 只是把重复的归一化/取值逻辑收敛到一处。
// ============================================================================

export interface PlainRecord {
  [key: string]: unknown
}

// 判断一个值是否为「一条业务记录」（扁平对象 + 含 id）
const isRecordLike = (value: unknown): value is PlainRecord =>
  typeof value === 'object' && value !== null && 'id' in value

/**
 * 把后端返回的 data 归一化为「记录数组」。
 * 兼容返回：数组 / 单个记录 / 「{ 0: rec, 1: rec, ... } 嵌套对象」/ 空 / null。
 * - 数组：原样返回
 * - 含 id 的嵌套对象（如 { '0': {...}, '1': {...} }）：返回其所有记录值
 * - 单条记录对象：包成单元素数组
 * - 其余（空串 / 原始类型 / null）：返回 []
 */
export const toRecords = (data: unknown): PlainRecord[] => {
  if (Array.isArray(data)) {
    return data as PlainRecord[]
  }
  if (!data || typeof data !== 'object') {
    return []
  }
  const record = data as PlainRecord
  // 嵌套对象：值为记录的聚合（常见于后端把列表包在对象键下）
  const nestedValues = Object.values(record).filter(isRecordLike)
  if (nestedValues.length > 0) {
    return nestedValues
  }
  return isRecordLike(record) ? [record] : []
}

/**
 * 从单条记录里按候选 key 顺序取第一个字符串/数字。
 * 用于兼容后端同一字段的不同命名；数字会被转成字符串。
 * 全部取不到返回 fallback（默认 ''）。
 */
export const pickString = (record: PlainRecord, keys: string[], fallback = ''): string => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string') return value
    if (typeof value === 'number') return String(value)
  }
  return fallback
}
