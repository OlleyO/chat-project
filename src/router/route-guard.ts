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

  await loadUser()

  if (!to.meta.requireAuth || currentUser.value) {
    return next()
  } else {
    return next({ name: routeNames.login })
  }
}
