<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Delete, Loading, Picture } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type UploadFile } from 'element-plus'
import { useDetail, type RepairImageItem } from '@/composables/detail/useDetail'
import { checkImageSize } from '@/utils/imageUpload'

const props = defineProps<{
  repairId: number
  type: 'repair' | 'test'
  readonly: boolean
  size?: 'small' | 'default' | 'large'
  // 由父组件统一调用一次 getAcceptImg 后按 imagePhase 拆分传入，避免重复请求
  images: RepairImageItem[]
}>()

const emit = defineEmits<{
  // 上传/删除成功后通知父组件统一重拉前后图列表
  (e: 'changed'): void
}>()

const { uploadBefore, deleteRepairImage, uploadAfter } = useDetail()

const uploadRef = ref()

// 获取图片的完整 URL
const getImageUrl = (imgPath: string): string => {
  if (!imgPath) return ''
  if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
    return imgPath
  }
  if (imgPath.startsWith('/')) {
    return `/api${imgPath}`
  }
  return `/api/${imgPath}`
}

// 选完图片即自动上传（去掉独立的「上传图片」按钮）：
// 校验大小 -> 调新接口 uploadBefore/uploadAfter -> 通知父组件统一重拉图片列表
const handleFileChange = async (file: UploadFile) => {
  if (file.status !== 'ready' || !file.raw) return
  if (!checkImageSize(file)) {
    uploadRef.value?.clearFiles()
    return
  }
  if (!props.repairId) {
    ElMessage.error('维修单 ID 缺失，无法上传')
    uploadRef.value?.clearFiles()
    return
  }
  const raw = file.raw as File
  try {
    const success =
      props.type === 'repair'
        ? await uploadBefore(raw, props.repairId)
        : await uploadAfter(raw, props.repairId)
    if (success) {
      ElMessage.success('上传成功')
      emit('changed')
    } else {
      ElMessage.error('上传失败')
    }
  } catch {
    ElMessage.error('上传失败')
  } finally {
    // 选完即传，不再暂存，清空 el-upload 内部列表，避免与下方服务器图片列表重复展示
    uploadRef.value?.clearFiles()
  }
}

const handleDeleteImage = async (index: number) => {
  ElMessageBox.confirm('确定要删除这张图片吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const imgItem = props.images[index]
      if (!imgItem) return
      const success = await deleteRepairImage(imgItem.id)
      if (success) {
        ElMessage.success('删除成功')
        emit('changed')
      } else {
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}
</script>

<template>
  <div>
    <div class="image-preview-list">
      <div class="image-wrapper" v-for="(img, index) in images" :key="img.id">
        <el-image
          :src="getImageUrl(img.address)"
          :preview-src-list="images.map((img) => getImageUrl(img.address))"
          class="preview-image"
          fit="cover"
        >
          <template #placeholder>
            <div class="image-loading">
              <el-icon class="image-loading-icon"><Loading /></el-icon>
            </div>
          </template>
          <template #error>
            <div class="image-error">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-image>
        <div
          class="image-delete-btn"
          @click="handleDeleteImage(index)"
          :style="{
            pointerEvents: readonly ? 'none' : 'auto',
            opacity: readonly ? 0 : 1,
          }"
        >
          <el-icon><Delete /></el-icon>
        </div>
      </div>
      <!-- 选择图片卡片与图片同处一个 flex 容器，内联排列、空间不足才换行；
           只读模式（已完成状态）整体隐藏 -->
      <el-upload
        ref="uploadRef"
        class="image-upload-trigger"
        v-show="!readonly"
        action="#"
        list-type="picture-card"
        :on-change="handleFileChange"
        accept="image/*"
        multiple
        :auto-upload="false"
        :disabled="readonly"
      >
        <template #default>
          <el-icon><Plus /></el-icon>
          <div>选择图片</div>
        </template>
      </el-upload>
    </div>
  </div>
</template>

<style scoped>
:deep(.el-upload--picture-card) {
  width: 120px;
  height: 120px;
}

.image-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.image-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  cursor: pointer;
}

.image-loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.image-loading-icon {
  font-size: 28px;
  color: var(--el-color-primary);
  animation: rotating 2s linear infinite;
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.image-error .el-icon {
  font-size: 28px;
  color: var(--el-text-color-secondary);
}

.image-delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-wrapper:hover .image-delete-btn {
  opacity: 1;
}
</style>
