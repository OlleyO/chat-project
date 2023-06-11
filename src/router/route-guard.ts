import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

import { routeNames } from './route-names'

export const routeGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  const { currentUser } = storeToRefs(authStore)
  const { loadUser } = authStore

  try {
    if (to.meta.requireAuth) {
      await loadUser()

      if (currentUser.value?.user_metadata.is_admin) {
        if (to.meta.requireAdmin) {
          return next()
        }
      } else {
        if (currentUser.value) {
          return next()
        }
      }

      return next({ name: routeNames.login })
    } else {
      return next()
    }
  } catch (err) {
    notificationHandler('Session expired')

    return next({ name: routeNames.login })
  }
}
