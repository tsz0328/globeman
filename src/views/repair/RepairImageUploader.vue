<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type UploadFile } from 'element-plus'
import { useDetail, type RepairImageItem } from '@/composables/detail/useDetail'
import { checkImageSize } from '@/utils/imageUpload'

const props = defineProps<{
  repairId: number
  type: 'repair' | 'test'
  readonly: boolean
  size?: 'small' | 'default' | 'large'
}>()

const {
  getRepairImages,
  uploadBefore,
  deleteRepairImage,
  getTestImages,
  uploadAfter,
  deleteTestImage,
} = useDetail()

const uploadRef = ref()
const images = ref<RepairImageItem[]>([])

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

const refresh = async () => {
  if (!props.repairId) {
    images.value = []
    return
  }
  images.value =
    props.type === 'repair'
      ? await getRepairImages(props.repairId)
      : await getTestImages(props.repairId)
}

defineExpose({ refresh })

onMounted(() => {
  if (props.repairId) refresh()
})
// 父组件在 onMounted 中才拿到真实 repairId，靠 watch 触发首刷
watch(
  () => props.repairId,
  (id) => {
    if (id) refresh()
  },
)

// 选完图片即自动上传（去掉独立的「上传图片」按钮）：
// 校验大小 -> 调新接口 uploadBefore/uploadAfter -> 刷新服务器图片列表 -> 清空 el-upload 暂存
const handleFileChange = async (file: UploadFile, _fileList: UploadFile[]) => {
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
      await refresh()
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
      const imgItem = images.value[index]
      if (!imgItem) return
      const success =
        props.type === 'repair'
          ? await deleteRepairImage(imgItem.id)
          : await deleteTestImage(imgItem.id)
      if (success) {
        images.value.splice(index, 1)
        ElMessage.success('删除成功')
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
        />
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
    </div>
    <el-upload
      ref="uploadRef"
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
