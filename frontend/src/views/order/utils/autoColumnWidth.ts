/**
 * 按内容自动测量列宽（el-table 原生不支持内容自适应，这里用 canvas measureText 估算）。
 *
 * 设计要点：
 * - 传入「全量行」而非当前页行，保证翻页时列宽稳定不跳变。
 * - 结果为每列「最宽单元格（含表头）」的像素宽度 + 内边距；短列按内容收、长列自然撑开。
 * - 配合 el-table：把 flex 列（通常是最长的内容列，如「参数」）用 :min-width 绑定，
 *   其余列用 :width 绑定；el-table 会把剩余空间灌给 min-width 列 → 既不换行、也不留大片空白。
 */

const PADDING = 36 // 单元格内边距：el-table 默认 .cell padding 约 12px/侧 + readonly-text 额外 4px/侧 + 4px 余量（break-all 下差 1px 就换行，留保险）
const MIN_WIDTH = 70 // 任何列的最小宽度下限，避免极短内容把列压得看不清

// ⚠ canvas 的 ctx.font 必须带字体族：'14px' 这种缺 family 的 shorthand 是非法赋值，
// 会被静默忽略、停留在默认 '10px sans-serif' → 全部按 10px 量、列宽系统性偏窄 → 换行。
// 页面实际字体：WorkView 全局 font-family: sans-serif，故用 '14px sans-serif' 保持一致。
export const CELL_FONT = '14px sans-serif'
const HEADER_FONT = `bold ${CELL_FONT}` // 表头 th 是 font-weight: bold，按粗体量才不亏

let ctx: CanvasRenderingContext2D | null = null
function getCtx(font: string): CanvasRenderingContext2D {
  if (!ctx) {
    const canvas = document.createElement('canvas')
    ctx = canvas.getContext('2d')
  }
  if (ctx) ctx.font = font
  return ctx as CanvasRenderingContext2D
}

export function measureTextWidth(text: string, font = CELL_FONT): number {
  const c = getCtx(font)
  if (!c) return (text?.length ?? 0) * 8 // 兜底：拿不到 canvas 时用等宽估算
  return c.measureText(text ?? '').width
}

export interface ColSpec {
  /** 行数据字段名 */
  key: string
  /** 表头文字（参与宽度比较，表头短中文一般比内容窄，但保险起见一起比） */
  label: string
  /** 是否为「弹性列」：用 min-width 绑定，吸收表格剩余空间（通常给最长的内容列） */
  flex?: boolean
  /** 自定义取值：列内容由模板拼装、row[key] 不是最终展示文本时使用（如「执行地」= 省-市-区） */
  value?: (row: Record<string, unknown>) => unknown
}

/**
 * 计算各列宽度（像素）。
 * @param rows   全量行（不要只传当前页）
 * @param specs  列定义，顺序即展示顺序
 * @param font   单元格字体（需与实际渲染字体一致，否则量出来有偏差）
 */
export function computeColumnWidths<T extends object>(
  rows: T[],
  specs: ColSpec[],
  font = CELL_FONT,
): Record<string, number> {
  const result: Record<string, number> = {}
  for (const spec of specs) {
    let max = measureTextWidth(spec.label, HEADER_FONT)
    for (const row of rows) {
      const v = spec.value
        ? spec.value(row as Record<string, unknown>)
        : (row as Record<string, unknown>)[spec.key]
      if (v == null || v === '') continue
      const w = measureTextWidth(String(v), font)
      if (w > max) max = w
    }
    result[spec.key] = Math.max(MIN_WIDTH, Math.ceil(max) + PADDING)
  }
  return result
}
