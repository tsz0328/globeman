import { computed, ref } from 'vue'
import Cookies from 'js-cookie'

// 全局共享头像状态：登录时由 useLogin 写入 cookie，上传头像时由此处更新。
// 用模块级 ref 作为单例，保证 WorkView（页头小头像）与 ProfileInfo 同步刷新。
const avatarPath = ref<string>(Cookies.get('avatar') || '')

export function buildAvatarUrl(avatar: string): string {
  if (!avatar) return '/1.jpg'
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar
  }
  if (avatar.startsWith('/')) {
    return `/api${avatar}`
  }
  return `/api/${avatar}`
}

export function useAvatar() {
  // 当前页头/各处的显示用头像 URL（响应式）
  const currentAvatarUrl = computed(() => buildAvatarUrl(avatarPath.value))

  // 上传成功后调用：同步更新 cookie 与共享状态，触发所有引用处刷新
  const setAvatar = (avatar: string) => {
    if (avatar) {
      Cookies.set('avatar', avatar, { expires: 7 })
      avatarPath.value = avatar
    } else {
      Cookies.remove('avatar')
      avatarPath.value = ''
    }
  }

  // 重新登录后从 cookie 重新拉取（保险机制）
  const syncFromCookie = () => {
    avatarPath.value = Cookies.get('avatar') || ''
  }

  return { avatarPath, currentAvatarUrl, buildAvatarUrl, setAvatar, syncFromCookie }
}
