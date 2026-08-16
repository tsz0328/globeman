import { defineStore } from 'pinia'
import Cookies from 'js-cookie'

// 集中管理登录态：token / role / account / username
// 注意：写入仍由各业务在登录/退出时写 Cookie（useLogin.ts、request.ts 过期清理）；
// 本 store 仅作为「集中读取」入口，初始化即从 Cookie 取值，避免各处散落 Cookies.get。
export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: Cookies.get('token') ?? '',
    role: Cookies.get('role') ?? '',
    account: Cookies.get('account') ?? '',
    username: Cookies.get('username') ?? '',
  }),
  getters: {
    // 是否管理员（与 Menu.vue 原逻辑一致：忽略大小写）
    isAdmin: (s) => s.role.toLowerCase() === 'admin',
    isLoggedIn: (s) => !!s.token,
  },
  actions: {
    setAuth(payload: { token?: string; role?: string; account?: string; username?: string }) {
      if (payload.token !== undefined) this.token = payload.token
      if (payload.role !== undefined) this.role = payload.role
      if (payload.account !== undefined) this.account = payload.account
      if (payload.username !== undefined) this.username = payload.username
    },
    clear() {
      this.token = ''
      this.role = ''
      this.account = ''
      this.username = ''
    },
  },
})
