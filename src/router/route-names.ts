import { notFoundRouteNames } from '@/views/404/404.routes'
import { adminRouteNames } from '@/views/admin/admin.routes'
import { authRouteNames } from '@/views/auth/auth.routes'
import { chatRouteNames } from '@/views/chat/chat.routes'
import { settingsRouteNames } from '@/views/settings/settings.routes'

export const routeNames = {
  rootPage: 'rootPage',

  ...notFoundRouteNames,
  ...authRouteNames,
  ...chatRouteNames,
  ...settingsRouteNames,
  ...adminRouteNames,

  additionalDefaultLayoutRoute: 'additionalDefaultLayoutRoute',
  additionalNoLayoutRoute: 'additionalNoLayoutRoute'
}
