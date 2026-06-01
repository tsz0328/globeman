<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { loginApi } from '@/api/LoginApi'
import { getUserInfoApi } from '@/api/UserApi'
import Cookies from 'js-cookie'
import CryptoJS from 'crypto-js'
import router from '@/router'

//定义数据类型
interface LoginForm {
  account: string
  password: string
}

interface UserDetailData {
  name?: string
  email?: string
  phone?: string
  department?: string
}

//初始化表单
const loginForm = reactive<LoginForm>({
  account: '',
  password: '',
})
//初始化按钮状态
const buttonStatus = ref(false)
//初始化按钮文字
const buttonText = ref('登录')
//加密密钥
const SECRET_KEY = 'qqr13637332568.'
//加密函数
function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString()
}
//登录成功后存储用户信息
async function setUserInfo(data: { role: string; token: string; company?: string; time?: string }) {
  const { role, token, company, time } = data
  Cookies.set('token', token, { expires: 1 })
  Cookies.set('account', loginForm.account, { expires: 7 })
  Cookies.set('password', encrypt(loginForm.password), { expires: 7 })
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

//存储用户个人信息
async function setUserDetailInfo(userData: UserDetailData) {
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
}

//登入请求
async function loginRequest() {
  try {
    buttonStatus.value = true
    buttonText.value = '登录中'
    const res = await loginApi(loginForm)
    if (res.code === 200) {
      setUserInfo(res.data)
      try {
        const userInfoRes = await getUserInfoApi(loginForm.account)
        if (userInfoRes.code === 200) {
          const userInfo = (userInfoRes.data as any)?.admin ?? (userInfoRes.data as any)
          setUserDetailInfo(userInfo as UserDetailData)
          const detailRole = userInfo.role
          if ((!res.data || !res.data.role) && detailRole) {
            Cookies.set('role', detailRole, { expires: 7 })
          }
          const detailCompany = userInfo.company
          if ((!res.data || !res.data.company) && detailCompany) {
            Cookies.set('company', detailCompany, { expires: 7 })
          }
          const detailTime =
            userInfo.time ?? userInfo.createTime ?? userInfo.createdAt ?? userInfo.created_at
          if ((!res.data || !res.data.time) && detailTime) {
            Cookies.set('time', detailTime, { expires: 7 })
          }
        }
      } catch (infoErr) {
        console.warn('获取用户详细信息失败:', infoErr)
      }
      ElMessage.success(res.msg || '登录成功')
      router.push({ name: 'LoginSuccess' })
    } else {
      ElMessage.error(res.msg || '登录失败')
    }
  } catch (err) {
    console.error('登录异常：', err)
    ElMessage.error('网络异常')
  } finally {
    buttonStatus.value = false
    buttonText.value = '登录'
  }
}
</script>

<template>
  <div class="login-title">
    <div class="bg-box">
      <div class="bg1"></div>
      <div class="bg2"></div>
      <div class="bg3"></div>
      <div class="bg4"></div>
    </div>
    <div class="login-content">
      <div class="title-box">
        <span class="text">用户登录</span>
      </div>
    </div>
  </div>

  <div class="content" style="height: 240px; padding: 20px 15px">
    <form class="el-form el-form--label-left" @submit.prevent="">
      <div class="el-form-item is-required">
        <div class="el-form-item__content">
          <div class="el-input el-input-group el-input-group--prepend">
            <div class="el-input-group__prepend">
              <div style="display: flex; align-items: center; color: rgb(37, 40, 59)">
                <img
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAA75JREFUWEftl09oFHcUx7/vt7MxLR56sFBBcKkz429pBQXBJLPCQgvmYGl6KFTooaWHChV6UGk8FBUCiehFNIgnPQgteLAlgRrIYQ87idAWeki7k50RVgiYg4ccpN1k1nl2NlmzWWbX+ePGKM5x973f9/O+7/eb3xvCFn9oi/PhDWDSDr3+DmZkXyZN4ht4dBQEFUAVjAUInnTJHa/88/tiEhcTOajL3EkGjwDobQNRBdOwPV+8HBcyNqAujVEGhkMJE4/YpZkfQ8W2BMUC3JM9PCTYu9O01hwzn68t90wryn/bhRAHWYhRAHI9hj6xreJkVMhYgJo0SuviPOVWe4YqlUK1WTyTyfem31qZBNNH9d8Zf9nz5oGuA6pZo48Ys2uiS8RprVwuPAoSVtVDu0hR/GK2+/+T52XL5VkrCmRkB3VpnGDgyqoI/WxbxWOdBHVp/MbA4GoMf21bMze7CqjKgXMEOlvHA8bKlnmmk6CWNa6BcXwt5rRtmZe6CqhJ4xSAi2Ed1GRuAuCjm+dggj3oEe+7X5qZ66qDyOcVbdH1N75/a4CZf3F29nyOQqG2QTifV/SH7gRTY/9hzrbMfVHg1rZR1BRAzw58wUw/NTIZ+EN4YnhlJfWn/5vSu3yIWIyBsP+lvAd9UVUaVwn4LlR5zBfs+Zlwt07LgpFfM835WnZgBEw/+Ka1Aa0y6LxjFcdCFRIQlAjQX0/X+yWn6DiYjjT2JQAHxFOe4Kv3/5514sLF3oNJBKPmJnYwqmDU+ESAmUz+nfTbtb38hFUCZ5iQrreF4TKoQily3H+V+UqlsBQVrBEfCdCfUJRtK0dI0CAYOQAfhhSeA6HIHt+tLfdMtU4+ndYIBbjng35VeOIkGF82JpOQYEFhj///NLjlgcfD3CodAXU9v8Mjd5QIX7V5lfgzoEPAAgOLDH6wevJoNwHvMbBr7WQHfRL4N88t8tKn241rHU/x+3uNg4Iw4QtttIEWmPkukferW902/bx21QfX3uWPmcWnRDQIsA/97PELA+Ezp2TeC7I70EEp+zI1pGab4fw7l4QYt0vF6QTthSpzebD3PRENNVEupejJAcu6V2ldOxBQk8YNoN5W1CsEHXOsYiEJWGuurudynuDb6yYED7+BgKo0HjYSmdDfzv6kwBs+H4BHtmW+G9ZBbgTalhnqpMeF1aTRUatdi18dwLjOxMkL6lY7B90OI1Qc7TA5Ndsy61dl89PukPjD6LebCFlj4LpjmSdCAYYpd7NiunpCX0QRbwCTurjlHXwKQhdnOMukgKEAAAAASUVORK5CYII="
                  width="18px"
                  height="18px"
                  alt=""
                  style="margin-right: 7px"
                />
                用户名
              </div>
            </div>
            <input
              type="text"
              autocomplete="off"
              name="userName"
              placeholder="请输入"
              class="el-input__inner"
              v-model="loginForm.account"
            />
          </div>
        </div>
      </div>
      <div class="el-form-item is-required">
        <div class="el-form-item__content">
          <div class="el-input el-input-group el-input-group--prepend el-input--suffix">
            <div class="el-input-group__prepend">
              <div style="display: flex; align-items: center; color: rgb(37, 40, 59)">
                <img
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAxtJREFUWEftmE9IFGEYxp933C0rCA9BUoFr7ri7UbAHId1RHKkgCiFPBRFIdchj1KGgiCgoiMBbHYQKgk6hh0SIqNF2VsHADpKzf8rtUBgEGWFZuztvzeqa2Wz7zbpF0X6nYeZ5v+c3z873Zz/CX96oFHwej1rlWp3aCNNcB0l6m/7ofpVMatOl6HtZgF6fcpAInQBUAK5FQOlv9zQCbscM/dZyQIsCrKtr8pJbukNAQyFzBp5IpnkoFhs2CmntnjsG9AaURjIxAEKVTYezACp/us+YzjC1v4iFw04hHQF6vds3weUaJaB6kdEDk+lq5rNLSya1WY9HrXSvSjcT8wkGdud0DEy5kGkyjJGkE0hngL5QLxHtmzdIM6ErMaH35DP0BpSjxLiW+z6ZuS8RjXT8FsDNPqWhgjD6PRE6nTDClwuZyX7lJIArC3WEpsSEPlKoLvdcOMF6v3KJgVPzhYl4tTsATbNG66+bqrrkqdQYgK1ZIaM7HtWPFypzDCj7lDEQgnMmfDYejVwUNZF9oTMgujCvH48b+jbRWuEEtwSUdymeG7krQe3jRvieqEkwoOyZYfRbejfw4ZmhrxWtFQbsaWzJEJFkdUyEHYcjQw9FTW4orbtMk+/n9EeGh4R9hYV6ayvnDEyithZN00QBH6uqKjE/yumVwUFhX2FhGTDPz/HvJijLoSAk7GWyBh7QsabiXO4ln34xb06m+KXoN1jrpprgCsna9WRb70zmfPaCpE8Ms//5RGQ8X1+2CcqB5p1gHliyhRLlcapLk0ltsTwbCVvAer8ysHihd+roVM9MfYlo2HaNtk/QH5oEyDO3aqCbid9blxtctP51mt84BbDTE6gGyG52rabFDb3NXmdzV14EmEKmNulwiyTyAl5/s0pYmBvLgCKh/aApJ+g4siUF5QTLCc4nUHCiLs+D5ZWkyNFSnmaKDG6h7P9J0CQcIDanlpvY0nriiiCIu4vaD3r9inXEVvBwsoTQDveDPuUYKHts9mcaoyse1a8L76gtoewPdRJoP9udmJYOOw3G3Xxwlo3w/+LSMTnr6StoudQ4oz3lbAAAAABJRU5ErkJggg=="
                  width="18px"
                  height="18px"
                  alt=""
                  style="margin-right: 7px"
                />
                密码
              </div>
            </div>
            <input
              type="password"
              autocomplete="off"
              name="password"
              placeholder="请输入"
              class="el-input__inner"
              v-model="loginForm.password"
            />
          </div>
        </div>
      </div>

      <div class="el-form-item" style="margin-bottom: 20px">
        <div class="el-form-item__content">
          <button class="loginBtn" @click="loginRequest" :disabled="buttonStatus">
            {{ buttonText }}
          </button>
        </div>
      </div>
      <div class="forgetPass"><span data-v-59e3a17f=""> 忘记密码 </span></div>
    </form>
  </div>
</template>

<style scoped>
.title-box {
  width: 100%;
  padding: 0 15px;
  display: flex;
  -webkit-box-pack: justify;
  justify-content: space-between;
  -webkit-box-align: baseline;
  align-items: baseline;
  margin: 0;
  user-select: none;
  box-sizing: border-box;
  color: #fff;
  font-size: 18px;
  font-weight: 500;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
}

.login-content {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  padding: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  color: #fff;
  font-size: 18px;
  font-weight: 500;
}

.bg-box {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
}

.login-title {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  padding: 0;
  width: 100%;
  background: linear-gradient(90deg, #0c1390, #eeeeff);
  position: relative;
  height: 40px;
  border-radius: 6px 0 0 0;
}

.bg1 {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  padding: 0;
  width: 66px;
  height: 66px;
  background: linear-gradient(19deg, #4cb8f9, hsla(0, 0%, 100%, 0));
  right: 16px;
  bottom: -48px;
  border-radius: 2px 2px 2px 2px;
  opacity: 0.2;
  transform: rotate(315deg);
  position: absolute;
}

.bg2 {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  padding: 0;
  border-radius: 2px 2px 2px 2px;
  opacity: 0.2;
  transform: rotate(315deg);
  position: absolute;
  width: 36px;
  height: 36px;
  background: linear-gradient(240deg, #4cb8f9, hsla(0, 0%, 100%, 0) 30%);
  right: 73px;
  bottom: -29px;
}

.bg3 {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  padding: 0;
  width: 103px;
  height: 103px;
  background: linear-gradient(35deg, #4cb8f9, hsla(0, 0%, 100%, 0) 30%);
  right: 126px;
  top: -86px;
  border-radius: 2px 2px 2px 2px;
  transform: rotate(315deg);
  position: absolute;
}

.bg4 {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  padding: 0;
  border-radius: 2px 2px 2px 2px;
  transform: rotate(315deg);
  position: absolute;
  width: 91px;
  height: 91px;
  background: linear-gradient(45deg, #4cb8f9, hsla(0, 0%, 100%, 0) 30%);
  right: 175px;
  top: -82px;
}

.content {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  background-color: #fff;
  min-height: 240px;
  height: 300px;
  padding: 20px 15px;
  border-radius: 0 0 0 6px;
}

.el-form--label-left {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  padding: 0;
}

.is-required {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0 0 36px;
  padding: 0;
  /*按钮之间的高度*/
  height: 30px;
  font-size: 14px;
}

.el-form-item__content {
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  padding: 0;
  /*输入栏和按钮之间的高度*/
  line-height: 40px;
  position: relative;
  font-size: 14px;
}

.el-input-group--prepend {
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  padding: 0;
  position: relative;
  font-size: 14px;
  line-height: normal;
  display: inline-table;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  vertical-align: top;
  height: 40px !important;
}

.el-input-group__prepend {
  border-radius: 0;
  width: 90px;
  padding: 0 8px;
  box-sizing: border-box;
  background: #f7f7f7;
  border: 1px solid #dcdfe6;
  border-right: 0;
  color: #909399;
  vertical-align: middle;
  display: table-cell;
  position: relative;
  white-space: nowrap;
  margin: 0;
  user-select: none;
  line-height: normal;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-text-size-adjust: 100%;
}

.el-input__inner {
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  border-collapse: separate;
  border-spacing: 0;
  user-select: none;
  font-family: sans-serif;
  margin: 0;
  -webkit-appearance: none;
  appearance: none;
  background-color: #fff;
  background-image: none;
  border: 1px solid #e1e1e1;
  border-radius: 0 4px 4px 0;
  box-sizing: border-box;
  color: #606266;
  font-size: inherit;
  height: 40px;
  line-height: 40px;
  outline: 0;
  padding: 0 15px;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  width: 100%;
  vertical-align: middle;
  display: table-cell;
  border-left: none;
}

.loginBtn {
  -webkit-text-size-adjust: 100%;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  padding: 0;
  text-align: center;
  width: 100%;
  height: 40px;
  font-size: 14px;
  font-weight: 700;
  line-height: 40px;
  background: linear-gradient(180deg, #4cb8f9, #08138d);
  color: #fff;
  cursor: pointer;
  /* 清除button默认样式 */
  border: none;
  outline: none;
  border-radius: 0;
  appearance: none;
}

.loginBtn:hover {
  background: linear-gradient(180deg, #66c7ff, #1020b3);
}

.loginBtn:active {
  background: #08138d;
}

.forgetPass {
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  padding: 0;
  font-size: 14px;
  color: #08138d;
  line-height: 2px;
}

.el-input--suffix {
  height: 40px;
}
</style>
