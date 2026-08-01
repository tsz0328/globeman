import request from '@/utils/request'

export interface LoginForm {
  account: string;
  password: string;
}

export interface LoginResponse {
  code: number;
  msg: string;
  data: {
    token: string;
    account: string;
    company: string;
    role: string;
    time: string;
  };
}

// 登录接口
export async function loginApi(loginForm: LoginForm): Promise<LoginResponse> {
  return request({
    url: '/login',
    method: 'post',
    data: loginForm,
    skipToken: true,
    headers: {
      account: loginForm.account
    }
  })
}
