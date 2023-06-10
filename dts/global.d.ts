import 'vue-router'

import { routeNames } from '@/router/route-names'
import { globalProperties, portalNames } from '@/plugins'
import { EBadgeType, EElComponentSize, EElComponentType } from '@/types/enums'

import type { PostgrestError, AuthError } from '@supabase/supabase-js'

declare module 'vue-router' {
  interface RouteMeta {
    // todo: this is just an example. Please setup your own route meta params.
    label?: string
    parentName?: string
    requireAuth?: boolean
    requireAdmin?: boolean
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    // todo: Here you define you global vue definitions.
    $portalNames: typeof portalNames
    $routeNames: typeof routeNames

    // todo: These ones are used only for element library for size and type props;
    $elComponentSize: typeof EElComponentSize
    $elComponentType: typeof EElComponentType

    $badgeType: typeof EBadgeType
  }
}

declare global {
  interface ObjectConstructor {
    keys<T>(obj: T): Array<keyof T>
  }

  type TAppError = PostgrestError | Error | AuthError | string
}

export { }
