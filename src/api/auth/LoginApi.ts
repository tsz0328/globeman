import request from '@/utils/request'
import { encodeStr, getLoginPublicKey } from '@/utils/encryptUtils'

// === 登录 ===
export interface LoginForm {
  account: string;
  password: string;
}

export interface LoginResponse {
  code: number;
  msg: string;
  data: {
    token: string;
    // 以下字段当前后端登录接口不返回，由登录后 getInfoUserApi 补齐
    account?: string;
    company?: string;
    role?: string;
    time?: string;
  };
}

// 登录（账号密码使用后端下发的 RSA 公钥加密后传输，后端解密校验）
export async function loginApi(loginForm: LoginForm): Promise<LoginResponse> {
  const publicKey = await getLoginPublicKey()
  return request({
    url: '/login',
    method: 'post',
    data: {
      account: encodeStr(loginForm.account, publicKey),
      password: encodeStr(loginForm.password, publicKey),
    },
    skipToken: true,
    headers: {
      account: loginForm.account
    }
  })
}
