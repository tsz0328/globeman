import { createRouter, createWebHistory } from 'vue-router'
import Cookies from 'js-cookie'
import IndexView from '@/layouts/IndexView.vue'
import WorkView from '@/layouts/WorkView.vue'
import LoginComponent from '@/views/index/LoginComponent.vue'
import LoginSuccessComponent from '@/views/index/LoginSuccess.vue'
import UserManagementComponent from '@/views/admin/UserManagement.vue'
import WorkHomeComponent from '@/views/layout/WorkHome.vue'
import ProjectManagementComponent from '@/views/project/ProjectManagement.vue'
import CustomerManagementComponent from '@/views/admin/CustomerManagement.vue'
import CompanyManagementComponent from '@/views/admin/CompanyManagement.vue'
import OrderDetailComponent from '@/views/project/ProjectOrderDetail.vue'
import RepairOrderDetailComponent from '@/views/repair/RepairOrderDetail.vue'
import ProjectOrderManagementComponent from '@/views/project/ProjectOrderManagement.vue'
import RepairManagementComponent from '@/views/repair/RepairManagement.vue'
import RepairOrderManagementComponent from '@/views/repair/RepairOrderManagement.vue'
import RepairAcceptComponent from '@/views/repair/RepairAccept.vue'
import EquipmentRepairInformationComponent from '@/views/repair/EquipmentRepairInformation.vue'
import OutboundManagementComponent from '@/views/inventory/OutboundManagement.vue'
import InboundManagementComponent from '@/views/inventory/InboundManagement.vue'
import InventoryManagementComponent from '@/views/inventory/InventoryManagement.vue'
import OrderManagementComponent from '@/views/order/OrderManagement.vue'
import UserDetailComponent from '@/views/admin/UserDetail.vue'
import ProfileInfoComponent from '@/views/layout/ProfileInfo.vue'
import DepartmentManagementComponent from '@/views/admin/DepartmentManagement.vue'
import CompanyDetailComponent from '@/views/admin/CompanyDetail.vue'

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
          component: WorkHomeComponent,
        },
        {
          path: 'profile',
          name: 'Profile',
          component: ProfileInfoComponent,
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
          path: 'project',
          name: 'Project',
          component: ProjectManagementComponent,
        },
        {
          path: 'order',
          name: 'Order',
          component: OrderManagementComponent,
        },
        {
          path: 'company',
          name: 'Company',
          component: CompanyManagementComponent,
        },
        {
          path: 'department',
          name: 'Department',
          component: DepartmentManagementComponent,
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
      path: '/project-order/:id',
      name: 'ProjectOrderManagement',
      component: ProjectOrderManagementComponent,
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
    {
      path: '/user-detail/:id',
      name: 'UserDetail',
      component: UserDetailComponent,
    },
    {
      path: '/company-detail/:id',
      name: 'CompanyDetail',
      component: CompanyDetailComponent,
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
