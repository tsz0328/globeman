import { ref } from 'vue'
import { loginApi } from '@/api/LoginApi'
import { getUserInfoApi } from '@/api/UserApi'
import Cookies from 'js-cookie'

export interface LoginForm {
  account: string
  password: string
}

interface UserDetailData {
  name?: string
  email?: string
  phone?: string
  department?: string
  role?: string
  company?: string
  avatar?: string
  time?: string
  createTime?: string
  createdAt?: string
  created_at?: string
  admin?: UserDetailData
}

const setUserInfo = (
  data: { role: string; token: string; company?: string; time?: string },
  account: string,
) => {
  const { role, token, company, time } = data
  Cookies.set('token', token, { expires: 1 })
  Cookies.set('account', account, { expires: 7 })
  if (company) {
    Cookies.set('company', company, { expires: 7 })
  }
  if (role) {
    Cookies.set('role', role, { expires: 7 })
  }
  if (time) {
    Cookies.set('time', time, { expires: 7 })
  }
}

const setUserDetailInfo = (userData: UserDetailData) => {
  if (userData.name) {
    Cookies.set('name', userData.name, { expires: 7 })
  }
  if (userData.email) {
    Cookies.set('email', userData.email, { expires: 7 })
  }
  if (userData.phone) {
    Cookies.set('phone', userData.phone, { expires: 7 })
  }
  if (userData.department) {
    Cookies.set('department', userData.department, { expires: 7 })
  }
  if (userData.avatar) {
    Cookies.set('avatar', userData.avatar, { expires: 7 })
  }
}

export function useLogin() {
  const loading = ref(false)

  const login = async (
    loginForm: LoginForm,
  ): Promise<{ success: boolean; message: string }> => {
    loading.value = true
    try {
      const res = await loginApi(loginForm)
      if (res.code === 200) {
        const loginData = res.data as {
          role?: string
          token?: string
          company?: string
          time?: string
        }
        setUserInfo(
          loginData as { role: string; token: string; company?: string; time?: string },
          loginForm.account,
        )
        try {
          const userInfoRes = await getUserInfoApi()
          if (userInfoRes.code === 200) {
            const userInfo =
              (userInfoRes.data as UserDetailData)?.admin ??
              (userInfoRes.data as UserDetailData)
            setUserDetailInfo(userInfo as UserDetailData)
            const detailRole = userInfo.role
            if (!loginData.role && detailRole) {
              Cookies.set('role', detailRole, { expires: 7 })
            }
            const detailCompany = userInfo.company
            if (!loginData.company && detailCompany) {
              Cookies.set('company', detailCompany, { expires: 7 })
            }
            const detailTime =
              userInfo.time ?? userInfo.createTime ?? userInfo.createdAt ?? userInfo.created_at
            if (!loginData.time && detailTime) {
              Cookies.set('time', detailTime, { expires: 7 })
            }
          }
        } catch (infoErr) {
          console.warn('获取用户详细信息失败:', infoErr)
        }
        return { success: true, message: res.msg || '登录成功' }
      }
      return { success: false, message: res.msg || '登录失败' }
    } catch (err) {
      console.error('登录异常：', err)
      return { success: false, message: '网络异常' }
    } finally {
      loading.value = false
    }
  }

  return { loading, login }
}
