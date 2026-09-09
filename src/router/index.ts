import { createRouter, createWebHistory } from 'vue-router'
import Cookies from 'js-cookie'
import { menuConfig } from '@/data/menuConfig'
import { useAuthStore } from '@/stores/auth'

// 路由级代码分割：全部视图改为动态 import，避免首屏加载全部 14k 行代码
const IndexView = () => import('@/layouts/IndexView.vue')
const WorkView = () => import('@/layouts/WorkView.vue')
const Login = () => import('@/layouts/components/LoginPage.vue')
const LoginSuccessComponent = () => import('@/layouts/components/LoginSuccess.vue')

const Home = () => import('@/views/home/HomePage.vue')

const UserDetailComponent = () => import('@/views/user/UserDetail.vue')
const UserManagementComponent = () => import('@/views/user/UserManagement.vue')

const PersonalCenter = () => import('@/views/profile/PersonalCenter.vue')

const CustomerManagementComponent = () => import('@/views/customer/CustomerManagement.vue')

const CompanyManagementComponent = () => import('@/views/company/CompanyManagement.vue')
const CompanyDetailComponent = () => import('@/views/company/CompanyDetail.vue')

const DepartmentManagementComponent = () => import('@/views/department/DepartmentManagement.vue')

const ProjectManagementComponent = () => import('@/views/project/ProjectManagement.vue')
const ProjectOrderManagement = () => import('@/views/project/ProjectOrderManagement.vue')

const OrderManagementComponent = () => import('@/views/order/OrderManagement.vue')

const RepairWarehousing = () => import('@/views/repair/RepairWarehousing.vue')
const RepairList = () => import('@/views/repair/RepairList.vue')
const RepairWarehouseOut = () => import('@/views/repair/RepairWarehouseOut.vue')
const RepairAccept = () => import('@/views/repair/RepairAccept.vue')
const RepairAcceptDeviceDetail = () => import('@/views/repair/RepairAcceptDeviceDetail.vue')

const OutboundManagementComponent = () => import('@/views/inventory/OutboundManagement.vue')
const InboundManagementComponent = () => import('@/views/inventory/InboundManagement.vue')
const InventoryManagementComponent = () => import('@/views/inventory/InventoryManagement.vue')

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
      path: '/repair-device-detail/:id',
      name: 'RepairAcceptDeviceDetail',
      component: RepairAcceptDeviceDetail,
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

// 由 menuConfig 的 adminOnly 标记推导「仅管理员可访问」的完整路由路径集合。
// 作为与侧边菜单一致的单一数据源：新增/调整管理员专属页只需改 menuConfig.ts，
// 菜单显隐与路由拦截两处自动联动，无需在路由里重复写 meta。
const adminOnlyPaths = new Set<string>()
for (const item of menuConfig) {
  if (!item.adminOnly) continue
  // 顶层项自身若就是可导航路由（如 /work/company）
  if (item.path.startsWith('/work')) adminOnlyPaths.add(item.path)
  // 子项（如 /work/platform-carousel、/work/platform-announcement）
  for (const child of item.children ?? []) {
    if (child.path.startsWith('/work')) adminOnlyPaths.add(child.path)
  }
}

router.beforeEach((to, from, next) => {
  const token = Cookies.get('token')
  if (!token && to.name !== 'Login') {
    next({ name: 'Login' })
    return
  }

  // 管理员专属路由拦截：已登录但非管理员直访时，重定向到工作区首页
  if (token && adminOnlyPaths.has(to.path)) {
    const auth = useAuthStore()
    if (!auth.isAdmin) {
      next({ name: 'Home' })
      return
    }
  }

  next()
})

export default router
