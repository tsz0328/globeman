import { createRouter, createWebHistory } from 'vue-router'
import IndexView from '@/View/IndexView.vue'
import WorkView from '@/View/WorkView.vue'
import LoginComponent from '@/components/Index/LoginComponent.vue'
import LoginSuccessComponent from '@/components/Index/LoginSuccess.vue'
import UserManagementComponent from '@/components/work/UserManagement.vue'
import HomeComponent from '@/components/work/HomeComponent.vue'
import ProjectManagementComponent from '@/components/work/ProjectManagement.vue'
import CustomerManagementComponent from '@/components/work/CustomerManagement.vue'
import CompanyManagementComponent from '@/components/work/CompanyManagement.vue'
import ProjectDetailComponent from '@/components/work/ProjectDetail.vue'
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
      ],
    },
    // 独立的项目详情路由（不在work布局中）
    {
      path: '/project-detail/:id',
      name: 'ProjectDetail',
      component: ProjectDetailComponent,
    },
  ],
})

// router.beforeEach((to, from, next) => {
//   const token = Cookies.get('token')
//   if (!token && to.name !== 'Login') {
//     next({name: 'Login'})
//     return
//   }

//   next()
// })

export default router
