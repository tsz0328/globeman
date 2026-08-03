<template>
  <div class="user-detail-page">
    <div class="page-header">
      <el-button @click="goBack">← 返回</el-button>
      <h2 class="title">用户详情</h2>
    </div>

    <el-card v-loading="loading">
      <template #header>
        <span class="section-title">用户信息</span>
      </template>
      <el-descriptions v-if="info" :column="2" border>
        <el-descriptions-item label="账号">{{ info.account }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ info.name }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ info.sex || '—' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag v-if="info.status === 0" type="danger">禁用</el-tag>
          <el-tag v-else type="success">正常</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="公司">{{ info.company || '—' }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ info.department || '—' }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ info.role }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ info.phone || '—' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ info.email || '—' }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{ info.card || '—' }}</el-descriptions-item>
        <el-descriptions-item label="地址">{{ info.address || '—' }}</el-descriptions-item>
        <el-descriptions-item label="出生日期">{{ info.birth || '—' }}</el-descriptions-item>
        <el-descriptions-item label="学历">{{ info.education || '—' }}</el-descriptions-item>
        <el-descriptions-item label="紧急联系人">{{ info.emergency || '—' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ info.time || '—' }}</el-descriptions-item>
      </el-descriptions>
      <el-empty v-else description="未找到该用户" />
    </el-card>

    <el-card>
      <template #header>
        <span class="section-title">证书图片</span>
      </template>

      <div class="image-preview-list" v-if="certificateImages.length">
        <div class="image-wrapper" v-for="(img, index) in certificateImages" :key="img.id ?? `${img.address}-${index}`">
          <el-image :src="getImageUrl(img.address || img.url || img.image || img.img || '')"
            :preview-src-list="certificatePreviewList" class="preview-image" fit="contain" />
          <div class="image-delete-btn" @click="handleDeleteCertificateImage(index)">
            <el-icon>
              <Delete />
            </el-icon>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无证书图片" />

      <el-upload ref="certificateUploadRef" action="." list-type="picture-card" :on-change="handleCertificateFileChange"
        :on-remove="handleCertificateFileRemove" :file-list="certificateFileList" accept="image/*" multiple
        :auto-upload="false">
        <template #default>
          <el-icon>
            <Plus />
          </el-icon>
          <div>上传图片</div>
        </template>
      </el-upload>

      <el-button type="primary" size="large" style="margin-top: 10px" @click="submitCertificateImages"
        :disabled="certificateFiles.length === 0">
        上传图片
      </el-button>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type UploadFile } from 'element-plus'
import {
  getUserInfoApi,
  getCertificateImagesApi,
  uploadCertificateImagesApi,
  deleteCertificateImageApi,
  type CertificateImageItem,
  type UserInfo,
} from '@/api/UserApi'

const route = useRoute()
const info = ref<UserInfo | null>(null)
const loading = ref(false)
const certificateUploadRef = ref()
const certificateImages = ref<CertificateImageItem[]>([])
const certificateFileList = ref<UploadFile[]>([])
const certificateFiles = ref<File[]>([])
const account = ref('')

// 关闭当前标签页（本页由 window.open 在新标签打开）
const goBack = () => {
  if (window.opener) {
    window.close()
  } else {
    window.history.back()
  }
}

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

// 证书图片预览列表（computed 缓存，避免每次渲染重新 map）
const certificatePreviewList = computed(() =>
  certificateImages.value.map((item) => getImageUrl(item.address || item.url || item.image || item.img || '')),
)

// 获取证书图片列表
const fetchCertificateImages = async (userAccount: string) => {
  try {
    const res = await getCertificateImagesApi(userAccount)
    if (res.code === 200) {
      certificateImages.value = Array.isArray(res.data) ? res.data : []
    }
  } catch (error) {
    console.error('获取证书图片失败:', error)
  }
}

// 处理证书图片上传
const handleCertificateFileChange = (file: UploadFile) => {
  if (file.status === 'ready' && file.raw) {
    certificateFiles.value.push(file.raw as File)
  }
}

// 处理证书图片移除
const handleCertificateFileRemove = (file: UploadFile) => {
  const rawFile = file.raw as File | undefined
  certificateFiles.value = certificateFiles.value.filter((item) => item !== rawFile)
}

// 删除证书图片
const handleDeleteCertificateImage = async (index: number) => {
  ElMessageBox.confirm('确定要删除这张证书图片吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      const imgItem = certificateImages.value[index]
      if (!imgItem) return
      // 优先用图片路径 url，没有则从其他字段取
      const imageUrl = imgItem.url || imgItem.address || imgItem.image || imgItem.img || imgItem.id || ''
      if (!imageUrl) {
        ElMessage.error('当前图片缺少标识，无法删除')
        return
      }
      try {
        const res = await deleteCertificateImageApi(imageUrl)
        if (res.code === 200) {
          certificateImages.value.splice(index, 1)
          ElMessage.success('删除成功')
        } else {
          ElMessage.error(res.msg || '删除失败')
        }
      } catch (error) {
        console.error('删除证书图片失败:', error)
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 提交证书图片上传
const submitCertificateImages = async () => {
  if (!account.value) {
    ElMessage.warning('缺少用户账号信息')
    return
  }
  if (certificateFiles.value.length === 0) {
    ElMessage.warning('请选择图片')
    return
  }

  try {
    const res = await uploadCertificateImagesApi(certificateFiles.value, account.value)
    if (res.code === 200) {
      ElMessage.success('证书图片上传成功')
      await fetchCertificateImages(account.value)
      certificateFiles.value = []
      certificateFileList.value = []
    } else {
      ElMessage.error(res.msg || '上传失败')
    }
  } catch (error) {
    console.error('上传证书图片失败:', error)
    ElMessage.error('上传失败')
  }
}

// 页面加载时获取用户信息和证书图片
onMounted(async () => {
  const accountParam = route.params.id
  const userAccount = typeof accountParam === 'string' ? decodeURIComponent(accountParam) : ''
  if (!userAccount) {
    return
  }
  account.value = userAccount
  loading.value = true
  try {
    const res = await getUserInfoApi(userAccount)
    if (res.code === 200 && res.data) {
      info.value = res.data
    } else {
      console.warn('获取用户信息返回异常:', res.msg)
    }

    // 证书图片统一走 fetchCertificateImages（内部 normalize 处理各种返回格式）
    await fetchCertificateImages(userAccount)
  } catch (error) {
    console.error('获取用户信息失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.user-detail-page {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid black;
  gap: 20px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-right: auto;
}

.section-title {
  font-weight: 600;
}

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
  width: calc(25% - 9px);
  aspect-ratio: 1;
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
