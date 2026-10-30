// 全局统一 API 响应结构（所有 api 模块共享，避免重复定义）
export interface ApiResponse<T = unknown> {
  code: number
  data: T
  msg?: string
  timestamp?: string
}
