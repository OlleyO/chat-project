import type { RouteRecordRaw } from 'vue-router'

export const notFoundRouteNames = {
  notFound: 'not-found'
}

export const notFoundRoutes: RouteRecordRaw = {
  name: notFoundRouteNames.notFound,
  path: '/:pathMatch(.*)*',
  component: () => import('./404.vue')
}
