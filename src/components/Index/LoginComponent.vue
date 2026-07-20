<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useLogin } from '@/composables/useLogin'
import router from '@/router'

const { login } = useLogin()

//定义数据类型
interface LoginForm {
  account: string
  password: string
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
//登入请求
async function loginRequest() {
  try {
    buttonStatus.value = true
    buttonText.value = '登录中'
    const { success, message } = await login(loginForm)
    if (success) {
      ElMessage.success(message)
      router.push({ name: 'LoginSuccess' })
    } else {
      ElMessage.error(message)
    }
  } catch {
    ElMessage.error('网络异常')
  } finally {
    buttonStatus.value = false
    buttonText.value = '登录'
  }
}
</script>

<template>
  <div class="login-title idx-base">
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
              aria-label="用户名"
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
              aria-label="密码"
              v-model="loginForm.password"
            />
          </div>
        </div>
      </div>

      <div class="el-form-item" style="margin-bottom: 20px">
        <div class="el-form-item__content">
          <button type="button" class="loginBtn" @click="loginRequest" :disabled="buttonStatus">
            {{ buttonText }}
          </button>
        </div>
      </div>
      <div class="forgetPass"><span > 忘记密码 </span></div>
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
  color: #fff;
  font-size: 18px;
  font-weight: 500;
}

.login-content {
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
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
}

.login-title {
  padding: 0;
  width: 100%;
  background: linear-gradient(90deg, #0c1390, #eeeeff);
  position: relative;
  height: 40px;
  border-radius: 6px 0 0 0;
}

.bg1 {
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
  background-color: #fff;
  min-height: 240px;
  height: 300px;
  padding: 20px 15px;
  border-radius: 0 0 0 6px;
}

.el-form--label-left {
  padding: 0;
}

.is-required {
  margin: 0 0 36px;
  padding: 0;
  /*按钮之间的高度*/
  height: 30px;
  font-size: 14px;
}

.el-form-item__content {
  padding: 0;
  /*输入栏和按钮之间的高度*/
  line-height: 40px;
  position: relative;
  font-size: 14px;
}

.el-input-group--prepend {
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
  background: #f7f7f7;
  border: 1px solid #dcdfe6;
  border-right: 0;
  color: #909399;
  vertical-align: middle;
  display: table-cell;
  position: relative;
  white-space: nowrap;
  line-height: normal;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;
}

.el-input__inner {
  border-collapse: separate;
  border-spacing: 0;
  font-family: sans-serif;
  -webkit-appearance: none;
  appearance: none;
  background-color: #fff;
  background-image: none;
  border: 1px solid #e1e1e1;
  border-radius: 0 4px 4px 0;
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
  padding: 0;
  font-size: 14px;
  color: #08138d;
  line-height: 2px;
}

.el-input--suffix {
  height: 40px;
}
</style>
