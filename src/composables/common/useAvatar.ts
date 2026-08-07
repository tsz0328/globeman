import { computed, ref } from 'vue'
import Cookies from 'js-cookie'
import defaultAvatar from '@/assets/2.jpg'

// === 共享状态（模块级单例：登录时由 useLogin 写入 cookie，上传头像时由此处更新；保证页头小头像与资料页同步刷新）===
const avatarPath = ref<string>(Cookies.get('avatar') || '')

// === 工具函数（头像 URL 拼接）===
export function buildAvatarUrl(avatar: string): string {
  if (!avatar) return defaultAvatar
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar
  }
  if (avatar.startsWith('/')) {
    return `/api${avatar}`
  }
  return `/api/${avatar}`
}

// === 组合函数（头像：URL / 更新 / 同步）===
export function useAvatar() {
  // === 当前显示用头像 URL（响应式）===
  const currentAvatarUrl = computed(() => buildAvatarUrl(avatarPath.value))

  // === 上传成功后更新（同步 cookie 与共享状态，触发所有引用处刷新）===
  const setAvatar = (avatar: string) => {
    if (avatar) {
      Cookies.set('avatar', avatar, { expires: 7 })
      avatarPath.value = avatar
    } else {
      Cookies.remove('avatar')
      avatarPath.value = ''
    }
  }

  // === 重新登录后从 cookie 重新拉取（保险机制）===
  const syncFromCookie = () => {
    avatarPath.value = Cookies.get('avatar') || ''
  }

  return { avatarPath, currentAvatarUrl, buildAvatarUrl, setAvatar, syncFromCookie }
}
