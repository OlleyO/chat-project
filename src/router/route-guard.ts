import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

import { routeNames } from './route-names'

export const routeGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const currentUser = await useSupabase().auth.getUser()

  if (!to.meta.requireAuth || currentUser) {
    return next()
  } else {
    return next({ name: routeNames.login })
  }
}
