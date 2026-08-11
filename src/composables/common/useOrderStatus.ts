// 订单 / 项目 / 维修单 状态相关的统一数据源。
// 集中维护状态 → el-tag 颜色映射、已提交常量、锁定判断，
// 避免各组件重复定义 getStatusType / lockedStatuses 导致颜色不一致或相互颠倒。

// 与 el-tag 的 type 一致的标签颜色类型
export type StatusTagType = '' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

// 已提交状态常量（提交按钮锁定判断用）
export const SUBMITTED_STATUS = '已提交'

// 编辑中状态常量（草稿态，未提交；此状态下设备明细行不可展开查看 SN 子表）
export const EDITING_STATUS = '编辑中'

// 已锁定（不可再编辑 / 提交 / 删除）的状态集合
export const LOCKED_STATUSES = ['已确认', '已完成', '已提交'] as const

// 判断状态是否已锁定
export const isOrderLocked = (status?: string | null): boolean =>
  !!status && (LOCKED_STATUSES as readonly string[]).includes(status)

// 各状态 → el-tag 颜色（全应用单一映射，修复此前各页面不一致 / 颠倒的问题）
const STATUS_TAG_MAP: Record<string, StatusTagType> = {
  编辑中: 'warning',
  已提交: 'success',
  已确认: 'danger',
  已完成: 'success',
  已取消: 'danger',
  待维修: 'warning',
  维修中: 'primary',
}

export const getStatusTagType = (status: string): StatusTagType =>
  STATUS_TAG_MAP[status] ?? 'info'
