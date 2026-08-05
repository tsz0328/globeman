import axios from 'axios'
import { ElMessage } from 'element-plus'
import Cookies from 'js-cookie'

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
      const account = Cookies.get('account')
      if (account) {
        config.headers.account = account
      }
    }
    return config
  },
  (errors) => {
    return Promise.reject(errors)
  },
)

// 登录态失效（token 过期/无效）的统一处理：
// 清除所有 cookie 并跳转登录页。
// 用模块级标志位避免并发多个请求同时过期时重复弹窗与重复跳转。
let isRedirectingToLogin = false
function redirectToLoginOnExpired(): void {
  // 清除所有 cookie（登录态）
  const allCookies = Cookies.get()
  for (const key in allCookies) {
    Cookies.remove(key, { path: '/' })
  }
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

// 登录态失效的统一出口：提示 + 清登录态 + 跳登录页 + reject
function handleAuthExpired(msg: string): Promise<never> {
  ElMessage.error(msg)
  redirectToLoginOnExpired()
  return Promise.reject(new Error(msg))
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
        return handleAuthExpired((res.msg as string) || '登录已过期，请重新登录')
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
        return handleAuthExpired(msg)
      }
    }
    console.error('Request Error:', error)
    ElMessage.error('请求超时')
    return Promise.reject(error)
  },
)

export default request
