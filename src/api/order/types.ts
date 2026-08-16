// 订单相关前端类型（表单数据 / 提交载荷 / 创单设备明细输入）
// 从 AddOrderForm.vue 迁出，消除 composable 反向依赖组件的层倒置

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

// 创单时一并提交的设备明细（字段对应后端 /client/order/createDetails 契约：name/model/type/brand/spec/number/price/remark）
// 注：前端设备明细已移除"单价""金额"列，price 不再由前端录入，故置为可选
export interface CreateOrderDetailInput {
  name: string
  model: string
  type?: string
  brand?: string
  spec?: string
  number: string | number
  price?: string | number
  remark?: string
}

// 提交载荷：订单表单 + 可选的设备明细（供父组件接收并转交 createOrder）
export interface OrderSubmitPayload extends OrderFormData {
  details?: CreateOrderDetailInput[]
}
