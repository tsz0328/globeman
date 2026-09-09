/**
 * 业务枚举统一数据源
 * ────────────────────────────────────────────────────────────
 * 订单类型 / 项目类型 / 订单状态 / 维修状态等业务字面量全项目只在本文件定义。
 * - value：存储 / 筛选 / 接口口径（订单、项目类型统一为两字值：销售/采购/维修）
 * - label：展示文案（下拉选项等）
 * 新增枚举值或调整口径只改这里，页面统一 v-for 渲染，禁止再手写字面量选项。
 */

export interface EnumOption<V extends string = string> {
  label: string
  value: V
}

// ============================================================
// 订单类型（订单 / 维修单共用：维修单的 type 同为 销售/采购/维修）
// ============================================================
export const ORDER_TYPE_VALUES = ['销售', '采购', '维修'] as const
export type OrderTypeValue = (typeof ORDER_TYPE_VALUES)[number]

export const ORDER_TYPES: readonly EnumOption<OrderTypeValue>[] = [
  { label: '销售订单', value: '销售' },
  { label: '采购订单', value: '采购' },
  { label: '维修订单', value: '维修' },
]

/** 订单类型展示文本：两字值（「销售」）补「订单」，已含「订单」的原样返回 */
export const orderTypeText = (type: string): string => {
  const t = (type || '').trim()
  if (!t) return ''
  return t.includes('订单') ? t : `${t}订单`
}

// ============================================================
// 项目类型
// ============================================================
export const PROJECT_TYPES: readonly EnumOption[] = [
  { label: '销售项目', value: '销售' },
  { label: '采购项目', value: '采购' },
  { label: '维修项目', value: '维修' },
]

// ============================================================
// 订单状态（与后端 getOrder 响应的 status 字面量一致）
// ============================================================
export const ORDER_STATUS = {
  EDITING: '编辑中',
  SUBMITTED: '已提交',
  CONFIRMED: '已确认',
  COMPLETED: '已完成',
  CANCELED: '已取消',
} as const

export type OrderStatusValue = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

export const ORDER_STATUS_OPTIONS: readonly EnumOption<OrderStatusValue>[] = Object.values(
  ORDER_STATUS,
).map((label) => ({ label, value: label }))

// ============================================================
// 维修状态
// ============================================================
export const REPAIR_STATUS = {
  PENDING: '待维修',
  IN_REPAIR: '维修中',
  COMPLETED: '已完成',
} as const

export type RepairStatusValue = (typeof REPAIR_STATUS)[keyof typeof REPAIR_STATUS]

export const REPAIR_STATUS_OPTIONS: readonly EnumOption<RepairStatusValue>[] = Object.values(
  REPAIR_STATUS,
).map((label) => ({ label, value: label }))
