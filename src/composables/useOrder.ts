import { ref } from 'vue'
import { createOrderApi, getOrdersApi, deleteOrderApi, type OrderData } from '@/api/OrderApi'
import type { OrderFormData } from '@/components/work/OrderForm.vue'

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
        orderList.value.unshift({
          id: response.data.id,
          projectId: Number(data.projectId),
          name: data.name,
          type: data.type,
          leaderAccount: data.leaderAccount,
          leader: '',
          creator: '',
          creatorAccount: '',
          customer: data.customer,
          contact: data.contact,
          contactPhone: data.contactPhone,
          province: data.province,
          city: data.city,
          district: data.district,
          company: '',
          status: '待确认',
          createTime: new Date().toLocaleString('zh-CN'),
        })
        return true
      }
      return false
    } catch (error) {
      console.error('创建订单失败:', error)
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

  return {
    orderList,
    createOrder,
    fetchOrders,
    deleteOrder,
  }
}