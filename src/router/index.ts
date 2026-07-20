import { createRouter, createWebHistory } from 'vue-router'
import Cookies from 'js-cookie'
import IndexView from '@/View/IndexView.vue'
import WorkView from '@/View/WorkView.vue'
import LoginComponent from '@/components/Index/LoginComponent.vue'
import LoginSuccessComponent from '@/components/Index/LoginSuccess.vue'
import UserManagementComponent from '@/components/work/UserManagement.vue'
import HomeComponent from '@/components/work/HomeComponent.vue'
import ProjectManagementComponent from '@/components/work/ProjectManagement.vue'
import CustomerManagementComponent from '@/components/work/CustomerManagement.vue'
import CompanyManagementComponent from '@/components/work/CompanyManagement.vue'
import OrderDetailComponent from '@/components/work/ProjectOrderDetail.vue'
import RepairOrderDetailComponent from '@/components/work/RepairOrderDetail.vue'
import OrderManagementComponent from '@/components/work/ProjectOrderManagement.vue'
import RepairManagementComponent from '@/components/work/RepairManagement.vue'
import RepairOrderManagementComponent from '@/components/work/RepairOrderManagement.vue'
import RepairAcceptComponent from '@/components/work/RepairAccept.vue'
import EquipmentRepairInformationComponent from '@/components/work/EquipmentRepairInformation.vue'
import OutboundManagementComponent from '@/components/work/OutboundManagement.vue'
import InboundManagementComponent from '@/components/work/InboundManagement.vue'
import InventoryManagementComponent from '@/components/work/InventoryManagement.vue'

// path: 'xxx' → 相对路径 → 拼在父路由后面
// path: '/xxx' → 绝对路径 → 直接跟在域名后面，无视父路由
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/index',
    },
    {
      path: '/index',
      name: 'Index',
      component: IndexView,
      children: [
        {
          path: 'login',
          name: 'Login',
          component: LoginComponent,
        },
        {
          path: 'success',
          name: 'LoginSuccess',
          component: LoginSuccessComponent,
        },
      ],
    },
    {
      path: '/work',
      name: 'Work',
      component: WorkView,
      redirect: '/work/home',
      children: [
        {
          path: 'home',
          name: 'Home',
          component: HomeComponent,
        },
        {
          path: 'project',
          name: 'Project',
          component: ProjectManagementComponent,
        },
        {
          path: 'user',
          name: 'User',
          component: UserManagementComponent,
        },
        {
          path: 'customer',
          name: 'Customer',
          component: CustomerManagementComponent,
        },
        {
          path: 'company',
          name: 'Company',
          component: CompanyManagementComponent,
        },
        {
          path: 'repair-management',
          name: 'RepairManagement',
          component: RepairManagementComponent,
        },
        {
          path: 'repair-accept',
          name: 'RepairAccept',
          component: RepairAcceptComponent,
        },
        {
          path: 'outbound',
          name: 'OutboundManagement',
          component: OutboundManagementComponent,
        },
        {
          path: 'inbound',
          name: 'InboundManagement',
          component: InboundManagementComponent,
        },
        {
          path: 'inventory',
          name: 'InventoryManagement',
          component: InventoryManagementComponent,
        },
      ],
    },
    {
      path: '/order/:id',
      name: 'OrderManagement',
      component: OrderManagementComponent,
    },
    {
      path: '/repair-order/:id',
      name: 'RepairOrderManagement',
      component: RepairOrderManagementComponent,
    },
    {
      path: '/repair-order-detail/:id',
      name: 'RepairOrderDetail',
      component: RepairOrderDetailComponent,
    },
    {
      path: '/order-detail/:id',
      name: 'OrderDetail',
      component: OrderDetailComponent,
    },
    {
      path: '/equipment-repair-information/:id',
      name: 'EquipmentRepairInformation',
      component: EquipmentRepairInformationComponent,
    },
  ],
})

router.beforeEach((to, from, next) => {
  const token = Cookies.get('token')
  if (!token && to.name !== 'Login') {
    next({ name: 'Login' })
    return
  }

  next()
})

export default router
