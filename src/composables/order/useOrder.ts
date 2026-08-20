import { ref } from 'vue'
import {
  createOrderApi,
  getOrdersApi,
  deleteOrderApi,
  submitOrderApi,
  updateOrderHeadApi,
  type OrderData,
  type OrderItem,
  type CreateOrderData,
  type UpdateOrderHeadData,
} from '@/api/order/OrderApi'
import { sortByCreateTimeDesc, formatDateTime } from '@/utils/sort'
import { generateTypedId } from '@/utils/idGenerator'
import type {
  OrderFormData,
  CreateOrderDetailInput,
} from '@/api/order/types'

// === 导出类型 ===
export interface Order {
  id: string
  projectId: string
  name: string
  type: string
  leaderAccount: string
  creator: string
  customer: string
  contact: string
  contactPhone: string
  province: string
  city: string
  district: string
  address: string
  company: string
  status: string
  createTime: string
  details: OrderItem[]
}

// === 共享状态（模块级单例）===
const orderList = ref<Order[]>([])

// === 组合函数（订单管理：创建 / 列表 / 删除 / 提交）===
export function useOrder() {
  // === 创建订单（可选附带设备明细，订单创建成功后再逐条创建设备）===
  const createOrder = async (
    data: OrderFormData,
    details?: CreateOrderDetailInput[],
  ): Promise<boolean> => {
    try {
      // 生成订单 id：2位 订单类型首字母 + 时间(YYYYMMDDHHmmssSSS) + 5 位随机字母数字
      const orderId = generateTypedId(data.type)
      // 组装 addOrder 契约载荷：project 映射自表单 projectId；time/status 由后端自动生成，前端传空串
      const orderPayload: CreateOrderData = {
        id: orderId,
        project: data.projectId ?? '',
        name: data.name,
        type: data.type,
        time: '',
        manager: data.manager,
        customer: data.customer,
        contact: data.contact,
        contactPhone: data.contactPhone,
        province: data.province,
        city: data.city,
        district: data.district,
        address: data.address,
      }
      if (details && details.length > 0) {
        // 明细字段对齐后端实体契约（同 addOrderDetail）：name/model/type/brand/spec/number
        orderPayload.details = details.map((d) => ({
          name: d.name,
          model: d.model,
          type: d.type ?? '',
          brand: d.brand ?? '',
          spec: d.spec ?? '',
          number: String(d.number ?? ''),
        }))
      }
      const response = await createOrderApi(orderPayload)

      if (response.code === 200) {
        return true
      } else {
        console.error('创建订单失败，后端返回:', response)
        return false
      }
    } catch (error) {
      console.error('创建订单异常:', error)
      return false
    }
  }

  // === 获取订单列表（getOrdersApi 不带参数，返回全部订单；如需按项目筛，在拿到全量后本地过滤）===
  const fetchOrders = async (projectId?: string): Promise<void> => {
    try {
      const response = await getOrdersApi()

      if (response.code === 200) {
        const data = response.data
        if (typeof data === 'object' && data !== null) {
          const orders: Order[] = data.map((item: OrderData) => ({
            id: item.id,
            projectId: item.project ?? '',
            name: item.name,
            type: item.type,
            leaderAccount: item.manager,
            creator: item.creator ?? '',
            customer: item.customer,
            contact: item.contact,
            contactPhone: item.contactPhone ?? '',
            province: item.province,
            city: item.city,
            district: item.district,
            address: item.address || '',
            company: item.company ?? '',
            status: item.status || '无状态',
            createTime: formatDateTime(item.time),
            details: item.details ?? [],
          }))
          // 按项目本地过滤（getOrdersApi 不支持服务端筛选项）
          const filtered = projectId
            ? orders.filter((o) => o.projectId === projectId)
            : orders
          // 按创建时间降序（最新在前）排序
          // 兼容 "2026-07-17 10:32:20"（MySQL DATETIME，空格分隔）等非标准格式
          // 无效时间兜底为 0 排末尾；时间相同时用 id 兜底，保证稳定有序
          orderList.value = sortByCreateTimeDesc(filtered)
        } else {
          orderList.value = []
        }
      }
    } catch (error) {
      console.error('获取订单列表失败:', error)
    }
  }

  // === 删除订单 ===
  const deleteOrder = async (id: string): Promise<boolean> => {
    try {
      const response = await deleteOrderApi(id)

      if (response.code === 200) {
        const index = orderList.value.findIndex((order) => order.id === id)
        if (index !== -1) {
          orderList.value.splice(index, 1)
        }
        return true
      }
      return false
    } catch (error) {
      console.error('删除订单失败:', error)
      return false
    }
  }

  // === 提交订单 ===
  const submitOrder = async (id: string): Promise<boolean> => {
    try {
      const response = await submitOrderApi(id)

      if (response.code === 200) {
        return true
      }
      return false
    } catch (error) {
      console.error('提交订单失败:', error)
      return false
    }
  }

  // === 更新订单表头（编辑中订单可修改）===
  const updateOrderHead = async (data: UpdateOrderHeadData): Promise<boolean> => {
    try {
      const response = await updateOrderHeadApi(data)

      if (response.code === 200) {
        return true
      }
      return false
    } catch (error) {
      console.error('更新订单表头失败:', error)
      return false
    }
  }

  return {
    orderList,
    createOrder,
    fetchOrders,
    deleteOrder,
    submitOrder,
    updateOrderHead,
  }
}
