// 订单 / 项目 / 维修单 状态相关的统一数据源。
// 状态字面量统一定义在 src/constants/orderEnums.ts，本文件在其上封装
// 状态 → el-tag 颜色映射、锁定判断，避免各组件重复定义 getStatusType /
// lockedStatuses 导致颜色不一致或相互颠倒。

import { ORDER_STATUS, REPAIR_STATUS } from '@/constants/orderEnums'

// 与 el-tag 的 type 一致的标签颜色类型
export type StatusTagType = '' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

// 已提交状态常量（提交按钮锁定判断用）
export const SUBMITTED_STATUS = ORDER_STATUS.SUBMITTED

// 编辑中状态常量（草稿态，未提交；此状态下设备明细行不可展开查看 SN 子表）
export const EDITING_STATUS = ORDER_STATUS.EDITING

// 已锁定（不可再编辑 / 提交 / 删除）的状态集合
export const LOCKED_STATUSES = [
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.COMPLETED,
  ORDER_STATUS.SUBMITTED,
] as const

// 判断状态是否已锁定
export const isOrderLocked = (status?: string | null): boolean =>
  !!status && (LOCKED_STATUSES as readonly string[]).includes(status)

// 各状态 → el-tag 颜色（全应用单一映射，修复此前各页面不一致 / 颠倒的问题）
const STATUS_TAG_MAP: Record<string, StatusTagType> = {
  [ORDER_STATUS.EDITING]: 'warning',
  [ORDER_STATUS.SUBMITTED]: 'success',
  [ORDER_STATUS.CONFIRMED]: 'danger',
  [ORDER_STATUS.COMPLETED]: 'success',
  [ORDER_STATUS.CANCELED]: 'danger',
  [REPAIR_STATUS.PENDING]: 'warning',
  [REPAIR_STATUS.IN_REPAIR]: 'primary',
}

export const getStatusTagType = (status: string): StatusTagType =>
  STATUS_TAG_MAP[status] ?? 'info'
