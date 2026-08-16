// 设备明细行展开后的 SN 子记录（每条序列号一行，对应后端 repair 子表）
export interface SnRow {
  id: number
  parentId: number
  sn: string
  status: string
  lastSn?: string
  submitting?: boolean
  // 空白新增行（编辑态，失焦提交到 /client/repair/addSN），区别于既有 SN 记录
  isBlank?: boolean
  // 本次会话内已成功提交到后端的 SN 行（本地展示用，只读、不再重复提交）
  committed?: boolean
}
