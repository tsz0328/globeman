<template>
  <el-dialog
    :model-value="modelValue"
    width="80vw"
    align-center
    destroy-on-close
    class="repair-detail-dialog"
    @update:model-value="emit('update:modelValue', $event)"
    @opened="onDialogOpened"
  >
    <!-- 维修订单详情（只读查看） -->
    <div class="repair-detail-form" v-if="order">
      <div class="form-header">
        <div class="form-title">维修订单详情</div>
      </div>
      <!-- 订单信息（只读展示，不可编辑） -->
      <div class="form-info">
        <div class="info-row">
          <div class="info-item">
            <span class="label">订单名称：</span><span class="value">{{ order.name || '' }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">客户单位：</span
            ><span class="value">{{ order.customer || '' }}</span>
          </div>
          <div class="info-item">
            <span class="label">负责人：</span
            ><span class="value">{{ order.leaderAccount || '' }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">省市区：</span>
            <span class="value">
              {{ [order.province, order.city, order.district].filter(Boolean).join(' ') || '' }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">收货信息：</span
            ><span class="value">{{ order.address || '' }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">联系人：</span><span class="value">{{ order.contact || '' }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系电话：</span
            ><span class="value">{{ order.contactPhone || '' }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">订单号：</span><span class="value">{{ order.id || '' }}</span>
          </div>
          <div class="info-item">
            <span class="label">创建时间：</span
            ><span class="value">{{ order.createTime || '' }}</span>
          </div>
        </div>
        <!-- 打印专用行：合同编号 / 付款条件（屏幕上隐藏，打印时显示） -->
        <div class="info-row print-only">
          <div class="info-item full">
            <span class="label">合同编号：</span><span class="value"></span>
          </div>
        </div>
        <div class="info-row print-only">
          <div class="info-item full">
            <span class="label">付款条件（盖章后有效）：</span><span class="value"></span>
          </div>
        </div>
      </div>

      <!-- 设备表格（维修专用：SN 展示 + 可删除 + 分页） -->
      <RepairDeviceTable
        ref="deviceTableRef"
        :model-value="modelValue"
        :order="order"
        :details="details"
        @changed="emit('details-changed')"
      />
    </div>

    <!-- 表单底部 -->
    <template #footer>
      <el-button @click="emit('update:modelValue', false)">关闭</el-button>
      <el-button type="primary" @click="handleInbound">确定入库</el-button>
      <el-button @click="printOrder">打印</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { type Order } from '@/composables/order/useOrder'
import type { RepairOrderDetail } from '@/api/repair/RepairApi'
import RepairDeviceTable from './RepairDeviceTable.vue'

defineProps<{
  modelValue: boolean
  order: Order | null
  // 维修单明细：已随列表接口内联返回，传入后弹窗直接用
  details: RepairOrderDetail[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'details-changed'): void
}>()

// 设备表格引用：弹窗 @opened（布局就绪）时触发其映射明细 + 测量每页行数
const deviceTableRef = ref<InstanceType<typeof RepairDeviceTable>>()

// 弹窗打开动画结束、布局就绪后再加载，避免首开过渡未结束导致测量行数偏小
const onDialogOpened = () => {
  nextTick(() => deviceTableRef.value?.reload())
}

// 打印订单：用隐藏 iframe 承载打印内容，避免操作 document.body.innerHTML 导致页面状态丢失
const printOrder = () => {
  const printContent = document.querySelector('.repair-detail-form') as HTMLElement | null
  if (!printContent) return
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)
  const doc = iframe.contentWindow?.document
  if (!doc) return
  doc.open()

  /* 底部盖章栏 HTML：作为 .repair-detail-form 的最后一个子元素插入，
     这样它和表格共享同一个容器，左右边框自然对齐 */
  const footerHtml =
    '<div class="print-footer">' +
    '<div class="print-footer-row">' +
    '<div class="print-footer-item"><div><span class="label">采购单位（甲方盖章）：</span></div>' +
    '<div><span class="label">代表人（签名）：</span></div><div><span class="label">日期：</span></div></div>' +
    '<div class="print-footer-item"><div><span class="label">供应单位（甲方盖章）：</span></div>' +
    '<div><span class="label">代表人（签名）：</span></div><div><span class="label">日期：</span></div></div>' +
    '</div></div>'

  // 把 footer 插进 .repair-detail-form 内部（最后一个闭合 </div> 之前），
  // 避免 append 在 body 末尾导致 footer 与表单容器宽度不一致
  const contentHtml = printContent.outerHTML
  const lastClose = contentHtml.lastIndexOf('</div>')
  const mergedHtml =
    lastClose >= 0
      ? contentHtml.slice(0, lastClose) + footerHtml + contentHtml.slice(lastClose)
      : contentHtml + footerHtml

  doc.write(
    '<!DOCTYPE html><html><head><title>打印维修订单</title>' +
      '<style>' +
      'body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:24px;}' +
      /* element-plus 样式文件在此环境不存在，这里内联补齐表格的基础样式。
         打印走 iframe，组件 scoped / @media print 均不生效，故需在此统一处理 */
      '.repair-detail-form{box-sizing:border-box;}' +
      '.el-table,.el-table table{width:100%;border-collapse:collapse;}' +
      '.el-table__cell{border:1px solid #dcdfe6;padding:8px;text-align:center;}' +
      '.repair-detail-form .el-table__fixed-right{display:none !important;}' +
      '.no-print{display:none !important;}' +
      '.print-footer{border:1px solid #dcdfe6;border-top:none;}' +
      '.print-footer-row{display:flex;}' +
      '.print-footer-item{flex:1;padding:12px;border-right:1px solid #dcdfe6;}' +
      '.print-footer-item:last-child{border-right:none;}' +
      '.print-footer-item div{margin-bottom:12px;min-height:20px;}' +
      '.print-footer-item div:last-child{margin-bottom:0;}' +
      '.print-footer-item .label{font-weight:500;}' +
      '</style>' +
      '</head><body>' +
      mergedHtml +
      '</body></html>',
  )
  doc.close()
  // 等待样式与图片加载后再打印
  iframe.contentWindow?.focus()
  setTimeout(() => {
    iframe.contentWindow?.print()
    // 打印（或取消）后移除 iframe，不刷新页面
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe)
    }, 300)
  }, 250)
}

// 入库：接口待定，先放置占位处理（点击不报错，便于后续对接真实接口）。
const handleInbound = () => {
  ElMessage.info('入库功能待对接（接口待定）')
}
</script>

<style scoped>
/* 付款条件 / 表单底部盖章栏：仅打印时显示。
   打印走隐藏 iframe（不含本组件 scoped 样式），所以这些元素在 iframe 中没有这个样式自动可见。
   用 .repair-detail-form 前缀提升优先级（scoped 下为 (0,3,0)），避免被后定义的 .info-row（display:flex）按相等优先级+靠后原则覆盖 */
.repair-detail-form .print-only {
  display: none;
}

.form-header {
  text-align: center;
  margin-bottom: 16px;
}

.form-title {
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 4px;
}

.form-info {
  border: 1px solid #dcdfe6;
  border-bottom: none;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  border-bottom: 1px solid #dcdfe6;
}

.info-item {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-right: 1px solid #dcdfe6;
}

.info-item:last-child {
  border-right: none;
}

.info-item.full {
  flex: none;
  width: 100%;
  border-right: none;
}

.info-item .label {
  white-space: nowrap;
  font-weight: 500;
}

.info-item .value {
  min-width: 80px;
  flex: 1;
  margin-left: 4px;
  min-height: 18px;
}

.form-footer {
  border: 1px solid #dcdfe6;
}

.footer-row {
  display: flex;
}

.footer-item {
  flex: 1;
  padding: 12px;
  border-right: 1px solid #dcdfe6;
}

.footer-item:last-child {
  border-right: none;
}

.footer-item div {
  margin-bottom: 8px;
}

.footer-item div:last-child {
  margin-bottom: 0;
}

/* 打印样式 */
@media print {
  .repair-detail-dialog :deep(.el-dialog__header),
  .repair-detail-dialog :deep(.el-dialog__footer) {
    display: none !important;
  }

  .repair-detail-dialog :deep(.el-dialog__body) {
    padding: 0 !important;
  }
}
</style>

<style>
/* 弹窗高度控制：class 落到 .el-dialog 上，用非 scoped 样式避开 teleport 导致的 scoped 失效。
   与订单详情弹窗保持一致：固定 80vh 高度、内容区内部滚动。 */
.repair-detail-dialog {
  height: 80vh;
  display: flex;
  flex-direction: column;
}

.repair-detail-dialog .el-dialog__body {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 维修订单详情表单整体占满弹窗剩余高度并纵向布局，让内部设备表格能撑满而不触发整体滚动 */
.repair-detail-dialog .repair-detail-form {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* 表头信息区固定高度，不挤压设备表格 */
.repair-detail-dialog .form-info {
  flex: none;
}

/* 打印区固定高度 */
.repair-detail-dialog .form-footer {
  flex: none;
}

/* 设备表格弹性占满弹窗剩余空间，使内部按高度动态计算每页行数 */
.repair-detail-dialog .repair-detail-editor {
  flex: 1;
  min-height: 0;
}
</style>
