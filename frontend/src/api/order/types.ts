// 订单相关前端类型（表单数据 / 提交载荷 / 创单设备明细输入）

// 订单创建表单数据
export interface OrderFormData {
  projectId?: string
  name: string
  type: string
  manager: string
  customer: string
  contact: string
  contactPhone: string
  province: string
  city: string
  district: string
  address: string
}

// 创单时一并提交的设备明细（字段对应后端 /client/order/createDetails 契约：name/model/brand/spec/price/remark）
// 注：前端设备明细已移除"单价""金额""数量"列——price 不再由前端录入故置为可选；数量按「一行一台」管理不再录入
export interface CreateOrderDetailInput {
  name: string
  model: string
  brand?: string
  spec?: string
  sn?: string
  /** 原型号（改造/销售单特有） */
  originalModel?: string
  /** 改型号（改造/销售单特有） */
  refitModel?: string
  /** 加工项目（改造/销售单特有） */
  processItem?: string
  price?: string | number
  remark?: string
}

// 提交载荷：订单表单 + 可选的设备明细（供父组件接收并转交 createOrder）
export interface OrderSubmitPayload extends OrderFormData {
  details?: CreateOrderDetailInput[]
}
