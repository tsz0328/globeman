import { ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus'

// 普通图片上传大小上限：5MB（头像除外，头像限制 1MB，见 Profile.vue）
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024

// 校验图片大小，超限时弹错误提示并返回 false
export function checkImageSize(file: UploadFile, maxBytes = MAX_IMAGE_SIZE): boolean {
  if (!file.raw) return false
  if (file.raw.size > maxBytes) {
    ElMessage.error(`图片大小不能超过 ${Math.round(maxBytes / 1024 / 1024)}MB`)
    return false
  }
  return true
}
