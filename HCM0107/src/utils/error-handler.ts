import { message } from 'ant-design-vue'

export const handleApiError = (error: unknown, fallback = '请求失败，请稍后重试') => {
  const err = error as { message?: string; stack?: string }
  const text = err?.message || fallback
  message.error(text)
  console.error(err?.stack || error)
}
