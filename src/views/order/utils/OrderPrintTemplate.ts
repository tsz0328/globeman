/**
 * 订单打印模板
 *
 * 职责：把订单数据渲染成完整可打印的 HTML 文档字符串，供隐藏 iframe 打印使用。
 * 本文件**不引用 Vue / Element Plus / 运行时 DOM**，只输出静态 HTML；
 * 排版样式以 ORDER_PRINT_CSS 常量内嵌在文档里，与模板结构同文件维护。
 *
 * 字段映射：
 * - 表头来自 UpdateOrderHeadData / Order（id/name/manager/customer/...）
 * - 设备明细来自 OrderItem（name/model/type/brand/spec/number）
 */

export interface PrintableOrderDetail {
  name: string
  model: string
  type: string
  brand: string
  spec: string
  number: string | number
}

export interface PrintableOrder {
  id: string
  name: string
  /** 订单类型（维修/销售/采购），打印页眉行展示为「XX订单」 */
  type: string
  manager: string
  customer: string
  contact: string
  contactPhone: string
  province: string
  city: string
  district: string
  address: string
  createTime: string
  details: PrintableOrderDetail[]
}

/* 打印排版样式（与下方模板结构一一对应，改模板时同步改这里）。
 * 注意：CSS 内容里不能出现字面的 style 结束标签序列（HTML5 rawtext 坑），
 * 本文件通过 JS 字符串拼接 <style> 标签，只要 CSS 里不含该字面量即安全。 */
const ORDER_PRINT_CSS = `
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

.order-print {
  color: #000;
}

/* 大标题：订单名称，居中加粗 */
.order-print-title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
}

/* 信息区：四行两列 + 合同编号/付款条件两行（空值供手写，与维修打印模板对齐） */
.order-print-info {
  margin-bottom: 24px;
}

.order-print-row {
  display: flex;
  margin-bottom: 4px;
}

.order-print-item {
  flex: 1;
  padding: 4px 12px;
}

.order-print-item .label {
  font-weight: 500;
}

/* 整行项：合同编号 / 付款条件独占一行（与维修打印模板同构） */
.order-print-item.full {
  flex: 0 0 100%;
}

/* 设备明细表 */
.order-print-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 32px;
  font-size: 14px;
}

/* 多页打印优化（单页时无副作用）：
 * thead 用 table-header-group → 每页自动重复表头；
 * tr 防分页截断 → 一行设备不会被拦腰切到两页 */
.order-print-table thead {
  display: table-header-group;
}

.order-print-table tr {
  page-break-inside: avoid;
}

.order-print-table th,
.order-print-table td {
  border: 1px solid #333;
  padding: 8px 6px;
  text-align: center;
  vertical-align: middle;
}

.order-print-table th {
  background: #f5f5f5;
  font-weight: bold;
  /* 表头不换行：table-layout:auto 下空数据列（类型/品牌）会被压到最小宽度，
   * nowrap 保证列宽至少容纳表头一行，避免表头被挤成两行 */
  white-space: nowrap;
}

/* 底部盖章栏：采购单位 / 供应单位，各占一半 */
.order-print-footer {
  display: flex;
  page-break-inside: avoid; /* 盖章栏整体不拆到两页 */
}

.order-print-footer-item {
  flex: 0 0 50%;
  padding: 12px;
}

.order-print-footer-item > div {
  margin-bottom: 12px;
}
`

function escapeHtml(text: unknown): string {
  if (text == null) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function regionText(order: PrintableOrder): string {
  return [order.province, order.city, order.district].filter(Boolean).join(' ')
}

export function renderOrderPrintHtml(order: PrintableOrder): string {
  const rows = order.details.map(
    (d, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(d.name)}</td>
        <td>${escapeHtml(d.model)}</td>
        <td>${escapeHtml(d.type)}</td>
        <td>${escapeHtml(d.brand)}</td>
        <td>${escapeHtml(d.spec)}</td>
        <td>${escapeHtml(d.number)}</td>
      </tr>`,
  )

  return `
<div class="order-print">
  <div class="order-print-title">${escapeHtml(order.name)}</div>

  <div class="order-print-info">
    <div class="order-print-row">
      <div class="order-print-item"><span class="label">客户单位：</span>${escapeHtml(order.customer)}</div>
      <div class="order-print-item"><span class="label">负责人：</span>${escapeHtml(order.manager)}</div>
    </div>
    <div class="order-print-row">
      <div class="order-print-item"><span class="label">省市区：</span>${escapeHtml(regionText(order))}</div>
      <div class="order-print-item"><span class="label">收货信息：</span>${escapeHtml(order.address)}</div>
    </div>
    <div class="order-print-row">
      <div class="order-print-item"><span class="label">联系人：</span>${escapeHtml(order.contact)}</div>
      <div class="order-print-item"><span class="label">联系电话：</span>${escapeHtml(order.contactPhone)}</div>
    </div>
    <div class="order-print-row">
      <div class="order-print-item"><span class="label">订单号：</span>${escapeHtml(order.id)}</div>
      <div class="order-print-item"><span class="label">创建时间：</span>${escapeHtml(order.createTime)}</div>
    </div>
    <!-- 与维修打印模板（RepairOrderPrintTemplate）对齐：两行整行空值供打印后手写 -->
    <div class="order-print-row">
      <div class="order-print-item full"><span class="label">合同编号：</span></div>
    </div>
    <div class="order-print-row">
      <div class="order-print-item full"><span class="label">付款条件（盖章后有效）：</span></div>
    </div>
  </div>

  <table class="order-print-table">
    <thead>
      <tr>
        <th style="width: 50px;">序号</th>
        <th>品名</th>
        <th>型号</th>
        <th>类型</th>
        <th>品牌</th>
        <th>参数</th>
        <th style="width: 80px;">数量</th>
      </tr>
    </thead>
    <tbody>
      ${rows.length ? rows.join('') : '<tr><td colspan="7">暂无数据</td></tr>'}
    </tbody>
  </table>

  <div class="order-print-footer">
    <div class="order-print-footer-item">
      <div>采购单位（甲方盖章）：</div>
      <div>代表人（签名）：</div>
      <div>日期：</div>
    </div>
    <div class="order-print-footer-item">
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
export function renderOrderPrintDocument(order: PrintableOrder): string {
  return [
    '<!DOCTYPE html>',
    '<html>',
    '<head>',
    // title 塞一个不换行空格：空字符串会触发 Chrome 回退显示父页面标题
    // （index.html 的公司名），非空白的空白字符则不会
    '<title>\u00A0</title>',
    '<style>',
    ORDER_PRINT_CSS,
    '</style>',
    '</head>',
    '<body>',
    renderOrderPrintHtml(order),
    '</body>',
    '</html>',
  ].join('\n')
}
