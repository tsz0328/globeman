import { createRouter, createWebHistory } from 'vue-router'
import Cookies from 'js-cookie'
import IndexView from '@/View/IndexView.vue'
import WorkView from '@/View/WorkView.vue'
import LoginComponent from '@/components/Index/LoginComponent.vue'
import LoginSuccessComponent from '@/components/Index/LoginSuccess.vue'
import UserManagementComponent from '@/components/admin/UserManagement.vue'
import HomeComponent from '@/components/layout/HomeComponent.vue'
import ProjectManagementComponent from '@/components/project/ProjectManagement.vue'
import CustomerManagementComponent from '@/components/admin/CustomerManagement.vue'
import CompanyManagementComponent from '@/components/admin/CompanyManagement.vue'
import OrderDetailComponent from '@/components/project/ProjectOrderDetail.vue'
import RepairOrderDetailComponent from '@/components/repair/RepairOrderDetail.vue'
import ProjectOrderManagementComponent from '@/components/project/ProjectOrderManagement.vue'
import RepairManagementComponent from '@/components/repair/RepairManagement.vue'
import RepairOrderManagementComponent from '@/components/repair/RepairOrderManagement.vue'
import RepairAcceptComponent from '@/components/repair/RepairAccept.vue'
import EquipmentRepairInformationComponent from '@/components/repair/EquipmentRepairInformation.vue'
import OutboundManagementComponent from '@/components/inventory/OutboundManagement.vue'
import InboundManagementComponent from '@/components/inventory/InboundManagement.vue'
import InventoryManagementComponent from '@/components/inventory/InventoryManagement.vue'
import OrderManagementComponent from '@/components/order/OrderManagement.vue'
import UserDetailComponent from '@/components/admin/UserDetail.vue'
import ProfileInfoComponent from '@/components/layout/ProfileInfo.vue'
import DepartmentManagementComponent from '@/components/admin/DepartmentManagement.vue'
import CompanyDetailComponent from '@/components/admin/CompanyDetail.vue'

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
