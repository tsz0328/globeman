import axios from 'axios'
import { ElMessage } from 'element-plus'
import Cookies from 'js-cookie'
import { useAuthStore } from '@/stores/auth'

// 扩展 axios 类型：skipToken 为顶层自定义字段，
// 用于标记请求是否需要携带 token（如登录接口无需 token）。
// 通过模块增强声明合并，使 TS 在调用处与拦截器中均能识别该字段。
declare module 'axios' {
  interface AxiosRequestConfig {
    skipToken?: boolean
  }
  interface InternalAxiosRequestConfig {
    skipToken?: boolean
  }
}

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api', // 通过 Vite 代理转发到后端
  timeout: 3000, // 请求超时时间3s
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    if (config.skipToken !== true) {
      const token = Cookies.get('token')
      if (token) {
        config.headers.token = token
      } else {
        console.warn('No token found in Cookies!')
      }
    }
    return config
  },
  (errors) => {
    return Promise.reject(errors)
  },
)

// 从请求配置里取出该请求当时携带的 token（AxiosHeaders 大小写不敏感，做兼容读取）
function getTokenFromHeaders(headers: unknown): string | undefined {
  if (!headers || typeof headers !== 'object') return undefined
  const h = headers as Record<string, unknown> & { get?: (key: string) => unknown }
  const value = typeof h.get === 'function' ? h.get('token') : (h.token ?? h.Token)
  return value == null ? undefined : String(value)
}

// 登录态失效（token 过期/无效）的统一出口：提示 + 清登录态 + 跳登录页 + reject。
// failedToken = 发起该请求时携带的 token。若当前 cookie 已不是它（用户在过期期间
// 重新登录成功、或已切换账号），这是一条「迟到的 401」，不得清掉新登录态、不得踢回登录页——
// 否则后端重启/批量请求陆续返回 401 时，刚登录成功的用户会被再次清 cookie 弹回登录卡片。
function handleAuthExpired(msg: string, failedToken?: string): Promise<never> {
  const currentToken = Cookies.get('token')
  const isStale401 = !!currentToken && currentToken !== failedToken
  if (!isStale401) {
    ElMessage.error(msg)
    redirectToLoginOnExpired()
  }
  // 无论是否执行过期跳转，请求本身都按失败 reject（调用方 catch 走各自的错误分支）
  return Promise.reject(new Error(msg))
}

let isRedirectingToLogin = false
function redirectToLoginOnExpired(): void {
  // 清除所有 cookie（登录态）
  const allCookies = Cookies.get()
  for (const key in allCookies) {
    Cookies.remove(key, { path: '/' })
  }
  // 同步清空内存中的登录态：菜单显隐 / 顶栏用户名 / 首页欢迎语都读 auth store，
  // 只删 cookie 不清 store 会让这些展示在下次登录前仍停在过期账号的数据上
  useAuthStore().clear()
  if (isRedirectingToLogin) return
  isRedirectingToLogin = true
  // 动态 import 避免与 router 形成循环依赖
  import('@/router')
    .then((m) => m.default.push({ name: 'Login' }))
    .catch(() => {})
    .finally(() => {
      // 一段时间后重置标志，允许同一次会话中后续再次过期时仍能跳转
      setTimeout(() => {
        isRedirectingToLogin = false
      }, 1500)
    })
}

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data

    // 如果响应本身就是数组（例如某些接口直接返回数据列表）
    if (Array.isArray(res)) {
      return {
        code: 200,
        data: res,
        msg: 'success',
      }
    }

    // 处理空字符串、null、undefined响应
    if (res === '' || res === null || res === undefined) {
      return {
        code: 200,
        data: {},
        msg: 'success',
      }
    }

    //确保从后端返回的数据不为空
    if (!res) {
      return Promise.reject(new Error('无效的响应'))
    }

    // 如果已经是标准格式
    if (typeof res === 'object' && 'code' in res) {
      if (Number(res.code) === 200) {
        return res
      }
      // 登录态失效：少数环境后端在 token 过期/无效时返回 HTTP 200 + body { code: 401/403 }
      if (Number(res.code) === 401 || Number(res.code) === 403) {
        return handleAuthExpired(
          (res.msg as string) || '登录已过期，请重新登录',
          getTokenFromHeaders(response.config?.headers),
        )
      }
      return res
    }

    // 如果没有code字段，直接返回数据
    return {
      code: 200,
      data: res,
      msg: 'success',
    }
  },
  (error) => {
    // 后端过期/无权限通常返回 HTTP 401/403（axios 走 error 分支），响应体形如 { code: 401, msg: 'token已过期' }
    const errRes = error.response
    if (errRes) {
      const status = errRes.status
      const body = errRes.data
      const bodyCode =
        body && typeof body === 'object' && 'code' in body
          ? Number((body as { code: number }).code)
          : undefined
      if (status === 401 || status === 403 || bodyCode === 401 || bodyCode === 403) {
        const msg =
          body && typeof body === 'object' && 'msg' in body
            ? String((body as { msg: unknown }).msg)
            : '登录已过期，请重新登录'
        return handleAuthExpired(msg, getTokenFromHeaders(errRes.config?.headers))
      }
    }
    console.error('Request Error:', error)
    ElMessage.error('请求超时')
    return Promise.reject(error)
  },
)

export default request
