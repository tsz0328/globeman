/**
 * 维修订单打印模板
 *
 * 职责：把维修单数据渲染成完整可打印的 HTML 文档字符串，供隐藏 iframe 打印使用。
 * 本文件**不引用 Vue / Element Plus / 运行时 DOM**，只输出静态 HTML；
 * 排版样式以 REPAIR_PRINT_CSS 常量内嵌在文档里，与模板结构同文件维护。
 *
 * 与订单打印（src/views/order/print/OrderPrintTemplate.ts）同规范：
 * - @page margin 负责每页边距；页眉中间 title 用不换行空格保持空白
 * - thead 每页重复表头、tr 防分页截断、盖章栏整体不拆
 * 差异：设备表多一列「SN码」（明细按 SN 展开成多行）；信息区多
 * 「合同编号 / 付款条件（盖章后有效）」两行（print-only，值留空供手写）。
 * 注意：本文件 CSS 与订单打印的排版规则同源，改一处记得同步另一处。
 */

export interface PrintableRepairDetail {
  name: string
  model: string
  type: string
  brand: string
  spec: string
  sn: string
}

export interface PrintableRepairOrder {
  id: string
  name: string
  /** 维修单类型（维修/销售/采购），备用 */
  type: string
  /** 负责人（Order.leaderAccount） */
  manager: string
  customer: string
  contact: string
  contactPhone: string
  province: string
  city: string
  district: string
  address: string
  createTime: string
  /** 已按 SN 展开的明细行（每条 SN 一行，与屏幕表格一致） */
  details: PrintableRepairDetail[]
}

function escapeHtml(text: unknown): string {
  if (text == null) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function regionText(order: PrintableRepairOrder): string {
  return [order.province, order.city, order.district].filter(Boolean).join(' ')
}

/* 打印排版样式（与下方模板结构一一对应，改模板时同步改这里）。
 * 注意：CSS 内容里不能出现字面的 style 结束标签序列（HTML5 rawtext 坑）。 */
const REPAIR_PRINT_CSS = `
/* @page margin 负责每一页的边距（body padding 只作用于整个文档首尾，多页时
 * 中间页会贴边，所以每页留白必须由 @page 承担）。
 * 代价：浏览器会把打印页眉（日期/标题）和页脚（网址/页码）画在这个边距区域，
 * 需要在打印对话框里手动取消勾选「页眉和页脚」（Chrome 会记住上次选择） */
@page {
  margin: 10mm;
}

body {
  font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  padding: 0;
  margin: 0;
}

.repair-print {
  color: #000;
}

/* 大标题：订单名称，居中加粗 */
.repair-print-title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
}

/* 信息区：四行两列 */
.repair-print-info {
  margin-bottom: 24px;
}

.repair-print-row {
  display: flex;
  margin-bottom: 4px;
}

.repair-print-item {
  flex: 1;
  padding: 4px 12px;
}

.repair-print-item.full {
  flex: 0 0 100%;
}

.repair-print-item .label {
  font-weight: 500;
}

/* 设备明细表 */
.repair-print-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 32px;
  font-size: 14px;
}

/* 多页打印优化（单页时无副作用）：
 * thead 用 table-header-group → 每页自动重复表头；
 * tr 防分页截断 → 一行设备不会被拦腰切到两页 */
.repair-print-table thead {
  display: table-header-group;
}

.repair-print-table tr {
  page-break-inside: avoid;
}

.repair-print-table th,
.repair-print-table td {
  border: 1px solid #333;
  padding: 8px 6px;
  text-align: center;
  vertical-align: middle;
}

.repair-print-table th {
  background: #f5f5f5;
  font-weight: bold;
  /* 表头不换行：table-layout:auto 下空数据列（类型/品牌）会被压到最小宽度，
   * nowrap 保证列宽至少容纳表头一行，避免表头被挤成两行 */
  white-space: nowrap;
}

/* 底部盖章栏：采购单位 / 供应单位，各占一半 */
.repair-print-footer {
  display: flex;
  page-break-inside: avoid; /* 盖章栏整体不拆到两页 */
}

.repair-print-footer-item {
  flex: 0 0 50%;
  padding: 12px;
}

.repair-print-footer-item > div {
  margin-bottom: 12px;
}
`

export function renderRepairOrderPrintHtml(order: PrintableRepairOrder): string {
  const rows = order.details.map(
    (d, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(d.name)}</td>
        <td>${escapeHtml(d.model)}</td>
        <td>${escapeHtml(d.type)}</td>
        <td>${escapeHtml(d.brand)}</td>
        <td>${escapeHtml(d.spec)}</td>
        <td>${escapeHtml(d.sn)}</td>
      </tr>`,
  )

  return `
<div class="repair-print">
  <div class="repair-print-title">${escapeHtml(order.name)}</div>

  <div class="repair-print-info">
    <div class="repair-print-row">
      <div class="repair-print-item"><span class="label">客户单位：</span>${escapeHtml(order.customer)}</div>
      <div class="repair-print-item"><span class="label">负责人：</span>${escapeHtml(order.manager)}</div>
    </div>
    <div class="repair-print-row">
      <div class="repair-print-item"><span class="label">省市区：</span>${escapeHtml(regionText(order))}</div>
      <div class="repair-print-item"><span class="label">收货信息：</span>${escapeHtml(order.address)}</div>
    </div>
    <div class="repair-print-row">
      <div class="repair-print-item"><span class="label">联系人：</span>${escapeHtml(order.contact)}</div>
      <div class="repair-print-item"><span class="label">联系电话：</span>${escapeHtml(order.contactPhone)}</div>
    </div>
    <div class="repair-print-row">
      <div class="repair-print-item"><span class="label">订单号：</span>${escapeHtml(order.id)}</div>
      <div class="repair-print-item"><span class="label">创建时间：</span>${escapeHtml(order.createTime)}</div>
    </div>
    <div class="repair-print-row">
      <div class="repair-print-item full"><span class="label">合同编号：</span></div>
    </div>
    <div class="repair-print-row">
      <div class="repair-print-item full"><span class="label">付款条件（盖章后有效）：</span></div>
    </div>
  </div>

  <table class="repair-print-table">
    <thead>
      <tr>
        <th style="width: 50px;">序号</th>
        <th>品名</th>
        <th>型号</th>
        <th>类型</th>
        <th>品牌</th>
        <th>参数</th>
        <th>SN码</th>
      </tr>
    </thead>
    <tbody>
      ${rows.length ? rows.join('') : '<tr><td colspan="7">暂无数据</td></tr>'}
    </tbody>
  </table>

  <div class="repair-print-footer">
    <div class="repair-print-footer-item">
      <div>采购单位（甲方盖章）：</div>
      <div>代表人（签名）：</div>
      <div>日期：</div>
    </div>
    <div class="repair-print-footer-item">
      <div>供应单位（甲方盖章）：</div>
      <div>代表人（签名）：</div>
      <div>日期：</div>
    </div>
  </div>
</div>
  `.trim()
}

/**
 * 渲染完整打印文档（含 DOCTYPE / title / 内嵌样式），供 iframe doc.write 直接写入。
 */
export function renderRepairOrderPrintDocument(order: PrintableRepairOrder): string {
  return [
    '<!DOCTYPE html>',
    '<html>',
    '<head>',
    // title 塞一个不换行空格：空字符串会触发 Chrome 回退显示父页面标题
    // （index.html 的公司名），非空白的空白字符则不会
    '<title>\u00A0</title>',
    '<style>',
    REPAIR_PRINT_CSS,
    '</style>',
    '</head>',
    '<body>',
    renderRepairOrderPrintHtml(order),
    '</body>',
    '</html>',
  ].join('\n')
}
