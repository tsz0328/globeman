import { ref } from 'vue'
import { createOrderApi, getOrdersApi, deleteOrderApi, type OrderData } from '@/api/OrderApi'
import type { OrderFormData } from '@/components/work/AddOrderForm.vue'

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
  repairAddress: string
  company: string
  status: string
  createTime: string
}

const orderList = ref<Order[]>([])

export function useOrder() {
  const createOrder = async (data: OrderFormData): Promise<boolean> => {
    try {
      const response = await createOrderApi(data)
      console.log('创建订单响应:', response)

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
            repairAddress: item.repair_address || '',
            company: item.company,
            status: item.state,
            createTime: item.time,
          }))
          orderList.value = orders
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

  const fetchOrderById = async (orderId: number): Promise<Order | null> => {
    try {
      const response = await getOrdersApi(orderId)

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
            repairAddress: item.repair_address || '',
            company: item.company,
            status: item.state,
            createTime: item.time,
          }))
          return orders.find((order) => order.id === orderId) || null
        }
      }
      return null
    } catch (error) {
      console.error('获取订单信息失败:', error)
      return null
    }
  }

  const getOrderName = (orderId: number): string | undefined => {
    const order = orderList.value.find((o) => o.id === orderId)
    return order?.name
  }

  return {
    orderList,
    createOrder,
    fetchOrders,
    deleteOrder,
    fetchOrderById,
    getOrderName,
  }
}
