import type { TAppError } from '@/types/general'

import { ElNotification, type NotificationParams } from 'element-plus'

export const notificationHandler = (message: TAppError, options?: NotificationParams) => {
  ElNotification({
    message: (message as Error)?.message || message as string || 'Oops, something went wrong',
    type: 'error',
    ...options
  })
}
