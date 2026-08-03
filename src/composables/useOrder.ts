import { ref } from 'vue'
import {
  createOrderApi,
  getOrdersApi,
  deleteOrderApi,
  submitOrderApi,
  type OrderData,
  type CreateOrderData,
} from '@/api/OrderApi'
import { sortByCreateTimeDesc, formatDateTime } from '@/utils/sort'
import { generateTypedId } from '@/utils/idGenerator'
import type { OrderFormData } from '@/components/work/AddOrderForm.vue'

// 创建订单时一并提交的设备明细（字段对应后端 /details/create 接口）
export interface CreateOrderDetailInput {
  name: string
  model: string
  type?: string
  brand?: string
  spec?: string
  number: string | number
  price: string | number
  remark?: string
}

export interface Order {
  id: string
  projectId: string
  name: string
  type: string
  leaderAccount: string
  leader: string
  creator: string
  creatorAccount: string
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
}

const orderList = ref<Order[]>([])

export function useOrder() {
  // 创建订单（可选附带设备明细，订单创建成功后再逐条创建设备）
  const createOrder = async (
    data: OrderFormData,
    details?: CreateOrderDetailInput[],
  ): Promise<boolean> => {
    try {
      // 生成订单 id：2位 订单类型首字母 + 时间(YYYYMMDDHHmmssSSS) + 5 位随机字母数字
      const orderId = generateTypedId(data.type)
      // 把设备明细一并提交到订单创建接口
      const orderPayload: CreateOrderData = { ...data, id: orderId } as CreateOrderData
      if (details && details.length > 0) {
        orderPayload.details = details.map((d) => ({
          name: d.name,
          model: d.model,
          type: d.type ?? '',
          brand: d.brand ?? '',
          spec: d.spec ?? '',
          number: String(d.number ?? ''),
          price: String(d.price ?? ''),
          remark: d.remark ?? '',
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

  // 获取订单列表
  const fetchOrders = async (projectId?: string): Promise<void> => {
    try {
      const response = await getOrdersApi(projectId)

      if (response.code === 200) {
        const data = response.data
        if (typeof data === 'object' && data !== null) {
          const orders: Order[] = data.map((item: OrderData) => ({
            id: item.id,
            projectId: item.project_id,
            name: item.name,
            type: item.type,
            leaderAccount: item.manager ?? '',
            leader: item.leader,
            creator: item.creator,
            creatorAccount: item.creator_account,
            customer: item.customer,
            contact: item.contact,
            contactPhone: item.contact_phone,
            province: item.province,
            city: item.city,
            district: item.district,
            address: item.address || '',
            company: item.company,
            status: item.status || '',
            createTime: formatDateTime(item.time),
          }))
          // 按创建时间降序（最新在前）排序
          // 兼容 "2026-07-17 10:32:20"（MySQL DATETIME，空格分隔）等非标准格式
          // 无效时间兜底为 0 排末尾；时间相同时用 id 兜底，保证稳定有序
          orderList.value = sortByCreateTimeDesc(orders)
        } else {
          orderList.value = []
        }
      }
    } catch (error) {
      console.error('获取订单列表失败:', error)
    }
  }

  // 删除订单
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

  // 提交订单
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

  return {
    orderList,
    createOrder,
    fetchOrders,
    deleteOrder,
    submitOrder,
  }
}
