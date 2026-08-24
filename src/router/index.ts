import { createRouter, createWebHistory } from 'vue-router'
import Cookies from 'js-cookie'

// 路由级代码分割：全部视图改为动态 import，避免首屏加载全部 14k 行代码
const IndexView = () => import('@/layouts/IndexView.vue')
const WorkView = () => import('@/layouts/WorkView.vue')
const Login = () => import('@/views/index/Login.vue')
const LoginSuccessComponent = () => import('@/views/index/LoginSuccess.vue')
const UserManagementComponent = () => import('@/views/admin/UserManagement.vue')
const Home = () => import('@/views/home/Home.vue')
const ProjectManagementComponent = () => import('@/views/project/ProjectManagement.vue')
const CustomerManagementComponent = () => import('@/views/admin/CustomerManagement.vue')
const CompanyManagementComponent = () => import('@/views/admin/CompanyManagement.vue')
const OrderDetailComponent = () => import('@/views/project/ProjectOrderDetail.vue')
const RepairOrderDetailComponent = () => import('@/views/repair/RepairOrderDetail.vue')
const ProjectOrderManagement = () => import('@/views/project/ProjectOrderManagement.vue')

const RepairWarehousing = () => import('@/views/repair/RepairWarehousing.vue')
const RepairList = () => import('@/views/repair/RepairList.vue')
const RepairWarehouseOut = () => import('@/views/repair/RepairWarehouseOut.vue')
const RepairAccept = () => import('@/views/repair/RepairAccept.vue')

const RepairDeviceDetail = () => import('@/views/repair/RepairDeviceDetail.vue')
const OutboundManagementComponent = () => import('@/views/inventory/OutboundManagement.vue')
const InboundManagementComponent = () => import('@/views/inventory/InboundManagement.vue')
const InventoryManagementComponent = () => import('@/views/inventory/InventoryManagement.vue')
const OrderManagementComponent = () => import('@/views/order/OrderManagement.vue')
const UserDetailComponent = () => import('@/views/admin/UserDetail.vue')
const PersonalCenter = () => import('@/views/profile/PersonalCenter.vue')
const DepartmentManagementComponent = () => import('@/views/admin/DepartmentManagement.vue')
const CompanyDetailComponent = () => import('@/views/admin/CompanyDetail.vue')
const FixedAssetManagement = () => import('@/views/asset/FixedAssetManagement.vue')
const ScrapAssetManagement = () => import('@/views/asset/ScrapAssetManagement.vue')
const CarouselManagement = () => import('@/views/platform/CarouselManagement.vue')
const AnnouncementManagement = () => import('@/views/platform/AnnouncementManagement.vue')

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
          component: Login,
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
          component: Home,
        },
        {
          path: 'personalCenter',
          name: 'PersonalCenter',
          component: PersonalCenter,
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
          path: 'repair-warehousing',
          name: 'RepairWarehousing',
          component: RepairWarehousing,
        },
        {
          path: 'repair-accept',
          name: 'RepairAccept',
          component: RepairAccept,
        },
        {
          path: 'repair-list',
          name: 'RepairList',
          component: RepairList,
        },
        {
          path: 'repair-warehouse-out',
          name: 'RepairWarehouseOut',
          component: RepairWarehouseOut,
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
        {
          path: 'fixedAsset',
          name: 'FixedAssetManagement',
          component: FixedAssetManagement,
        },
        {
          path: 'scrapAsset',
          name: 'ScrapAssetManagement',
          component: ScrapAssetManagement,
        },
        {
          path: 'platform-carousel',
          name: 'PlatformCarousel',
          component: CarouselManagement,
        },
        {
          path: 'platform-announcement',
          name: 'PlatformAnnouncement',
          component: AnnouncementManagement,
        },
      ],
    },
    {
      path: '/project-order/:id',
      name: 'ProjectOrderManagement',
      component: ProjectOrderManagement,
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
      path: '/repair-device-detail/:id',
      name: 'RepairDeviceDetail',
      component: RepairDeviceDetail,
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
