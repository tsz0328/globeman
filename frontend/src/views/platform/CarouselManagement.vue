<template>
  <WorkPage>
    <template #actions>
      <el-button type="primary" @click="openAdd">新增轮播图</el-button>
    </template>

    <template #filter>
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="标题">
          <el-input
            v-model="keyword"
            placeholder="搜索轮播图标题"
            style="width: 180px"
            clearable
            @clear="currentPage = 1"
          />
        </el-form-item>
      </el-form>
    </template>

    <el-table :data="pagedData" border style="width: 100%" v-loading="loading">
      <el-table-column label="图片预览" width="120">
        <template #default="scope">
          <img v-if="scope.row.url" :src="getImageUrl(scope.row.url)" class="thumb" alt="轮播图" />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="标题">
        <template #default="scope">{{ scope.row.title || '-' }}</template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="状态" width="90">
        <template #default="scope">
          <el-tag v-if="scope.row.status === undefined" type="info">-</el-tag>
          <el-tag v-else :type="scope.row.status === 0 ? 'success' : 'danger'">
            {{ scope.row.status === 0 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="149" class-name="action-column" fixed="right">
        <template #default="scope">
          <el-button
            :type="scope.row.status === 0 ? 'warning' : 'success'"
            size="small"
            :loading="statusLoadingUrl === scope.row.url"
            @click="toggleStatus(scope.row)"
          >
            {{ scope.row.status === 0 ? '停用' : '启用' }}
          </el-button>
          <el-button
            type="danger"
            size="small"
            :loading="deleteLoadingUrl === scope.row.url"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
      <template #empty>
        <span v-if="errorMsg" class="error-text">{{ errorMsg }}</span>
        <span v-else>暂无轮播图</span>
      </template>
    </el-table>

    <div class="pagination-section">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        layout="total, prev, pager, next, jumper"
        :total="filteredList.length"
      />
    </div>
  </WorkPage>

  <el-dialog v-model="dialogVisible" title="新增轮播图" width="480px" @closed="resetForm">
    <el-form label-width="80px">
      <el-form-item label="轮播图片" required>
        <el-upload
          ref="uploadRef"
          action="."
          list-type="picture-card"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :file-list="fileList"
          accept="image/*"
          :limit="1"
          :auto-upload="false"
        >
          <template #default>
            <el-icon><Plus /></el-icon>
            <div>选择图片</div>
          </template>
        </el-upload>
      </el-form-item>
      <el-form-item label="标题" required>
        <el-input v-model="form.title" placeholder="请输入轮播图标题" clearable />
      </el-form-item>
      <el-form-item label="排序" required>
        <el-input-number v-model="form.sort" :min="0" :max="100" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submitAdd">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox, type UploadFile } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import WorkPage from '@/components/common/WorkPage.vue'
import {
  addBannerApi,
  deleteBannerApi,
  getClientBannerListApi,
  updateBannerStatusApi,
  type ClientBannerItem,
} from '@/api/platform/CarouselApi'
import { checkImageSize } from '@/utils/imageUpload'

// 与项目约定一致：后端图片为相对路径时拼 /api 前缀，完整 http(s) 地址则原样使用
const getImageUrl = (imgPath: string): string => {
  if (!imgPath) return ''
  if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath
  return imgPath.startsWith('/') ? `/api${imgPath}` : `/api/${imgPath}`
}

const list = ref<ClientBannerItem[]>([])
const loading = ref(false)
const errorMsg = ref('')
const keyword = ref('')
const currentPage = ref(1)
const pageSize = 6

const fetchList = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await getClientBannerListApi()
    if (res.code === 200 && Array.isArray(res.data)) {
      // 按 sort 升序，保证顺序稳定
      list.value = [...res.data].sort((a, b) => a.sort - b.sort)
    } else {
      errorMsg.value = res.msg || '获取轮播图列表失败'
    }
  } catch (e) {
    // 401 = 未登录（该接口需 token）；提示用户先登录
    errorMsg.value = '获取轮播图列表失败，请确认已登录'
    console.error('获取轮播图列表失败:', e)
  } finally {
    loading.value = false
  }
}

const filteredList = computed(() =>
  keyword.value ? list.value.filter((i) => (i.title || '').includes(keyword.value)) : list.value,
)

const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredList.value.slice(start, start + pageSize)
})

onMounted(fetchList)

// 当前正在切换状态 / 正在删除 的行 url，分别用于两个按钮的独立 loading 态
const statusLoadingUrl = ref<string | null>(null)
const deleteLoadingUrl = ref<string | null>(null)

// 切换轮播图状态：后端按 url 自动切换 启用/停用（0=启用,1=停用）
const toggleStatus = async (row: ClientBannerItem) => {
  if (!row.url) return
  statusLoadingUrl.value = row.url
  try {
    const res = await updateBannerStatusApi(row.url)
    if (res.code === 200) {
      ElMessage.success('操作成功')
      fetchList()
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (e) {
    console.error('更新轮播图状态失败:', e)
  } finally {
    statusLoadingUrl.value = null
  }
}

// 删除轮播图：先确认再调接口
const handleDelete = async (row: ClientBannerItem) => {
  if (!row.url) return
  try {
    await ElMessageBox.confirm(
      `确定要删除轮播图「${row.title || row.url}」吗？`,
      '删除确认',
      { type: 'warning' },
    )
  } catch {
    return // 用户取消
  }
  deleteLoadingUrl.value = row.url
  try {
    const res = await deleteBannerApi(row.url)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchList()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (e) {
    console.error('删除轮播图失败:', e)
  } finally {
    deleteLoadingUrl.value = null
  }
}

// 新增轮播图：打开弹窗 → 选文件 + 填标题/排序 → 调 addBannerApi(文件, sort, title)
const dialogVisible = ref(false)
const submitting = ref(false)
const form = ref<{ title: string; sort: number }>({ title: '', sort: 0 })
const uploadRef = ref()
const fileList = ref<UploadFile[]>([])
const selectedFile = ref<File | null>(null)

const openAdd = () => {
  form.value = { title: '', sort: 0 }
  fileList.value = []
  selectedFile.value = null
  dialogVisible.value = true
}

const resetForm = () => {
  form.value = { title: '', sort: 0 }
  fileList.value = []
  selectedFile.value = null
}

const handleFileChange = (file: UploadFile) => {
  if (file.status === 'ready' && file.raw) {
    if (!checkImageSize(file)) {
      uploadRef.value?.handleRemove(file)
      return
    }
    selectedFile.value = file.raw as File
  }
}

const handleFileRemove = () => {
  selectedFile.value = null
}

const submitAdd = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请选择轮播图片')
    return
  }
  if (!form.value.title.trim()) {
    ElMessage.warning('请填写标题')
    return
  }
  submitting.value = true
  try {
    const res = await addBannerApi(selectedFile.value, form.value.sort, form.value.title.trim())
    if (res.code === 200) {
      ElMessage.success('新增成功')
      dialogVisible.value = false
      resetForm()
      fetchList() // 新增后刷新列表，新图立即出现在表格中
    } else {
      ElMessage.error(res.msg || '新增失败')
    }
  } catch (e) {
    console.error('新增轮播图失败:', e)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.thumb {
  width: 96px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
  display: block;
}

.error-text {
  color: var(--el-color-danger);
  font-size: 13px;
}

/* 操作列：按钮始终一行（loading 转圈时按钮变宽也不换行），保留 el-button 自带 12px 间距 */
:deep(.action-column) {
  white-space: nowrap;
}

.pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
