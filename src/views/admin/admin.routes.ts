import type { RouteRecordRaw } from 'vue-router'

import BlankLayout from '@/layouts/BlankLayout.vue'

export const adminRouteNames = {
  admin: 'admin',
  users: 'users'
}

export const adminRoutes: RouteRecordRaw = {
  name: adminRouteNames.admin,
  path: '/admin',
  component: BlankLayout,
  children: [
    {
      path: 'users',
      name: adminRouteNames.users,
      component: () => import('./Admin.vue')
    }
  ],
  meta: {
    requireAdmin: true
  }
}
