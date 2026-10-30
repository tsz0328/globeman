import { ElMessage } from 'element-plus'
import type { MessageHandler, MessageOptions } from 'element-plus'

/**
 * 同时可显示的消息条数上限。超出时**关掉最旧的一条**，保证最新反馈一定可见。
 *
 * 为什么不直接用 element-plus 自带的 `max` 配置：
 * 它的语义相反——`method.mjs` 里 `instances.length >= messageConfig.max` 时直接 return
 * 一个空 handler，即**达到上限后新消息不再显示**。用户点了却没反应，比堆一堆弹窗更糟。
 * 所以这里自己维护一个 FIFO 队列，实现「新的顶掉旧的」。
 */
const MAX_VISIBLE = 2

interface ActiveMessage {
  handler: MessageHandler | null
}

/** 当前仍在显示的消息，按弹出顺序排列（最旧的在前） */
const active: ActiveMessage[] = []

/** 从队列移除 */
function remove(entry: ActiveMessage): void {
  const index = active.indexOf(entry)
  if (index !== -1) active.splice(index, 1)
}

/** 主动关闭：用于给新消息腾位置（自动关闭路径由 onClose 回收，无需再 close 一次） */
function dismiss(entry: ActiveMessage): void {
  remove(entry)
  entry.handler?.close()
}

/**
 * 弹出一条消息。用法与 ElMessage 一致，只是 type 变成必填字段：
 *
 * ```ts
 * notify({ type: 'success', message: '创建成功' })
 * notify({ type: 'error', message: msg, duration: 5000 })
 * ```
 */
export function notify(options: MessageOptions & { type: NonNullable<MessageOptions['type']> }): void {
  // 腾位置：队列满时先关最旧的，避免新消息被静默丢弃
  while (active.length >= MAX_VISIBLE) {
    const oldest = active[0]
    if (!oldest) break
    dismiss(oldest)
  }

  const entry: ActiveMessage = { handler: null }
  const userOnClose = options.onClose

  // onClose 只会在消息真正关闭时触发（手动或自动），用它回收队列，
  // 否则队列里会残留已消失的消息，导致后续误判数量、提前关掉还在显示的消息
  entry.handler = ElMessage({
    ...options,
    onClose: () => {
      remove(entry)
      userOnClose?.()
    },
  })

  active.push(entry)
}
