<template>
  <div class="company-detail-page">
    <div class="page-header">
      <el-button @click="goBack">← 返回</el-button>
      <h2 class="title">公司详情</h2>
    </div>

    <el-card v-loading="loading">
      <template #header>
        <span class="section-title">公司信息</span>
      </template>

      <el-form :model="form" label-width="100px" style="max-width: 500px">
        <el-form-item label="公司名称">
          <el-input v-model="form.name" placeholder="请输入公司名称" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="form.account" placeholder="请输入负责人姓名" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <template #header>
        <span class="section-title">营业执照</span>
      </template>

      <div class="usci-preview" v-if="usciImageUrl">
        <div class="usci-wrapper">
          <el-image :src="usciImageUrl" class="usci-image" fit="cover" :preview-src-list="[usciImageUrl]" />
          <div class="usci-delete-btn" @click="handleDeleteUsci">
            <el-icon>
              <Delete />
            </el-icon>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂未上传营业执照" />

      <el-upload ref="usciUploadRef" action="." list-type="picture-card" :on-change="handleUsciFileChange"
        :file-list="usciFileList" accept="image/*" :auto-upload="false" :limit="1"
        :on-exceed="handleUsciExceed">
        <template #default>
          <el-icon>
            <Plus />
          </el-icon>
          <div>上传图片</div>
        </template>
      </el-upload>

      <el-button type="primary" size="large" style="margin-top: 10px" @click="handleUploadUsci"
        :disabled="!usciFile" :loading="uploading">
        上传营业执照
      </el-button>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus'
import { uploadUsciApi, getUsciApi, deleteUsciApi } from '@/api/admin/CompanyApi'
import { checkImageSize } from '@/utils/imageUpload'

const route = useRoute()

const companyId = ref('')
const loading = ref(false)
const saving = ref(false)

const form = ref({
  name: '',
  account: '',
  time: '',
})

// 营业执照
const usciUploadRef = ref()
const usciFile = ref<File | null>(null)
const usciFileList = ref<UploadFile[]>([])
const usciImageUrl = ref('')
const usciRawPath = ref('')
const uploading = ref(false)

const goBack = () => {
  if (window.opener) {
    window.close()
  } else {
    window.history.back()
  }
}

const handleSave = async () => {
  if (!form.value.name.trim()) {
    ElMessage.warning('请输入公司名称')
    return
  }
  saving.value = true
  try {
    ElMessage.success('保存成功')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 营业执照文件变更
const handleUsciFileChange = (file: UploadFile) => {
  if (!checkImageSize(file)) {
    usciUploadRef.value?.handleRemove(file)
    return
  }
  // limit=1，始终只保留最新选择的一个文件
  usciFile.value = file.raw as File | null
  usciFileList.value = [file]
}

// 超过上传数量限制
const handleUsciExceed = () => {
  ElMessage.warning('营业执照只能上传一张，请先删除已上传的图片')
}

// 上传营业执照
const handleUploadUsci = async () => {
  if (!usciFile.value) {
    ElMessage.warning('请选择图片')
    return
  }
  if (!form.value.name.trim()) {
    ElMessage.warning('请先填写公司名称')
    return
  }
  uploading.value = true
  try {
    const res = await uploadUsciApi(usciFile.value, form.value.name.trim())
    if (res.code === 200) {
      ElMessage.success('营业执照上传成功')
      // 预览刚上传的图片
      usciImageUrl.value = URL.createObjectURL(usciFile.value)
      usciFile.value = null
      usciFileList.value = []
      // 重新获取后端路径，供后续删除使用
      fetchUsci(form.value.name.trim())
    } else {
      ElMessage.error(res.msg || '上传失败')
    }
  } catch {
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
  }
}

// 删除营业执照
const handleDeleteUsci = async () => {
  if (!usciRawPath.value) {
    // 仅有本地预览（如刚上传），直接清除
    usciImageUrl.value = ''
    ElMessage.success('已清除')
    return
  }
  try {
    const res = await deleteUsciApi(usciRawPath.value)
    if (res.code === 200) {
      usciImageUrl.value = ''
      usciRawPath.value = ''
      ElMessage.success('删除成功')
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch {
    ElMessage.error('删除失败')
  }
}

// 获取营业执照
const fetchUsci = async (company: string) => {
  try {
    const res = await getUsciApi(company)
    if (res.code === 200 && res.data) {
      // 兼容两种返回格式：纯字符串路径 或 {url/address/image} 对象
      let imgPath: string
      if (typeof res.data === 'string') {
        imgPath = res.data
      } else {
        imgPath = res.data.url || res.data.address || res.data.image || ''
      }
      if (imgPath) {
        usciRawPath.value = imgPath
        usciImageUrl.value = getUsciImageUrl(imgPath)
      }
    }
  } catch (error) {
    console.error('获取营业执照失败:', error)
  }
}

// 构建图片 URL
const getUsciImageUrl = (imgPath: string): string => {
  if (!imgPath) return ''
  if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
    return imgPath
  }
  if (imgPath.startsWith('/')) {
    return `/api${imgPath}`
  }
  return `/api/${imgPath}`
}

onMounted(async () => {
  const id = route.params.id
  companyId.value = typeof id === 'string' ? id : ''
  form.value.name = (route.query.name as string) || ''
  form.value.account = (route.query.account as string) || ''
  form.value.time = (route.query.time as string) || ''

  if (form.value.name) {
    await fetchUsci(form.value.name)
  }
})
</script>

<style scoped>
.company-detail-page {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  border-bottom: 1px solid black;
  gap: 20px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.section-title {
  font-weight: 600;
}

.usci-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.usci-wrapper {
  position: relative;
  width: calc(25% - 9px);
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
}

.usci-image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  cursor: pointer;
}

.usci-delete-btn {
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

.usci-wrapper:hover .usci-delete-btn {
  opacity: 1;
}

:deep(.el-upload--picture-card) {
  width: 120px;
  height: 120px;
}
</style>
