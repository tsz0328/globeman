import { ref } from 'vue'
import {
  createOrderApi,
  getOrdersApi,
  deleteOrderApi,
  submitOrderApi,
  type OrderData,
} from '@/api/OrderApi'
import type { OrderFormData } from '@/components/work/AddOrderForm.vue'
import { sortByCreateTimeDesc } from '@/utils/sort'

export interface Order {
  id: number
  projectId: number
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
  const createOrder = async (data: OrderFormData): Promise<boolean> => {
    try {
      const response = await createOrderApi(data)

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

  const fetchOrders = async (projectId?: number): Promise<void> => {
    try {
      const response = await getOrdersApi(projectId)

      if (response.code === 200) {
        const data = response.data
        if (typeof data === 'object' && data !== null) {
          const orders: Order[] = Object.values(data).map((item: OrderData) => ({
            id: item.id,
            projectId: item.project_id,
            name: item.name,
            type: item.type,
            leaderAccount: item.leader_account,
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
            status: item.state,
            createTime: item.time,
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

  const deleteOrder = async (id: number): Promise<boolean> => {
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

  const submitOrder = async (id: number): Promise<boolean> => {
    try {
      const response = await submitOrderApi(id)

      if (response.code === 200) {
        const order = orderList.value.find((o) => o.id === id)
        if (order) {
          order.status = '已提交'
        }
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
