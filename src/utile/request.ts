import axios from 'axios'
import { ElMessage } from 'element-plus'
import Cookies from 'js-cookie'

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
    if (config.headers?.skipToken !== true) {
      const token = Cookies.get('token')
      if (token) {
        config.headers.token = token
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

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data
    //确保从后端返回的数据不为空
    if (!res || typeof res !== 'object') {
      return Promise.reject(new Error('无效的响应'))
    } else {
      if (Number(res.code) === 200) {
        return res
      }
      if (Number(res.code) === 403) {
        ElMessage.error('登录已过期，请重新登录')
        return res
      } else {
        return res
      }
    }
  },
  (error) => {
    ElMessage.error('请求超时')
    return Promise.reject(error)
  },
)

export default request
