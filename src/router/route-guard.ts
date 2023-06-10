import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

import { routeNames } from './route-names'

export const routeGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const { isAuthenticated } = storeToRefs(useAuthStore())

  if (!to.meta.requireAuth || isAuthenticated.value) {
    return next()
  } else {
    return next({ name: routeNames.login })
  }
}
