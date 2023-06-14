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

  const routeProtected = to.meta.requireAuth || to.meta.requireAdmin

  try {
    if (routeProtected) {
      await loadUser()

      const allowedAsAdmin = to.meta.requireAdmin && currentUser.value?.user_metadata.is_admin
      const allowedAsUser = currentUser.value && !to.meta.requireAdmin

      if (allowedAsAdmin || allowedAsUser) {
        return next()
      }

      return to.meta.requireAdmin ? next({ name: routeNames.notFound }) : next({ name: routeNames.login })
    } else {
      return next()
    }
  } catch (err) {
    return next({ name: routeNames.login })
  }
}
