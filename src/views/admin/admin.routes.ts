import type { RouteRecordRaw } from 'vue-router'

export const adminRouteNames = {
  admin: 'admin'
}

export const adminRoutes: RouteRecordRaw = {
  name: adminRouteNames.admin,
  path: '/admin',
  component: () => import('./Admin.vue'),
  meta: {
    requireAuth: true,
    requireAdmin: true
  }
}
