// 订单 / 项目 / 维修单 状态与业务类型相关的统一数据源。
// 状态/类型字面量统一定义在 src/constants/orderEnums.ts，本文件在其上封装
// 状态 → el-tag 颜色映射、业务类型 → el-tag 颜色映射、锁定判断，避免各组件重复
// 定义 getStatusType / getBizTypeTagType / lockedStatuses 导致颜色不一致或相互颠倒。

import { ORDER_STATUS, PROJECT_STATUS, REPAIR_STATUS } from '@/constants/orderEnums'

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
  // 注：REPAIR_STATUS.COMPLETED 与 ORDER_STATUS.COMPLETED 同值（'已完成'），
  // 颜色已由上面 ORDER_STATUS.COMPLETED 的 success 覆盖，无需也不能重复声明（同键会触发 TS1117）。
  // 项目状态：后端目前只写「执行中」，按「进行中 = 蓝」的口径与维修「维修中」保持一致
  [PROJECT_STATUS.RUNNING]: 'primary',
}

export const getStatusTagType = (status: string): StatusTagType =>
  STATUS_TAG_MAP[status] ?? 'info'

// 业务类型（订单 / 项目共用两字值 销售 / 采购 / 维修）→ el-tag 颜色。
// 刻意避开状态列的橙/绿主色系撞色：销售=蓝、采购=绿、维修=橙；未知值回退灰。
// 入参兼容存储值（「维修」）与展示值（「维修订单」/「维修项目」），先剥后缀再匹配。
const BIZ_TYPE_TAG_MAP: Record<string, StatusTagType> = {
  销售: 'primary',
  采购: 'success',
  维修: 'warning',
}

export const getBizTypeTagType = (type: string | null | undefined): StatusTagType => {
  const key = (type ?? '').trim().replace(/(订单|项目)$/, '')
  return BIZ_TYPE_TAG_MAP[key] ?? 'info'
}
