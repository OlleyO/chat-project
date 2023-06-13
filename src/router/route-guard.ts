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
    if (to.meta.requireAuth || to.meta.requireAdmin) {
      await loadUser()

      if (to.meta.requireAdmin && currentUser.value?.user_metadata.is_admin) {
        return next()
      } else {
        if (currentUser.value && !to.meta.requireAdmin) {
          return next()
        }
      }

      return to.meta.requireAdmin ? next({ name: routeNames.notFound }) : next({ name: routeNames.login })
    } else {
      return next()
    }
  } catch (err) {
    notificationHandler('Session expired')

    return next({ name: routeNames.login })
  }
}
