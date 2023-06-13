import { createApp } from 'vue'

import App from '@/App.vue'

import { router } from '@/router'
import { store } from '@/store/create-store'

import {
  PortalPlugin,
  VueGlobalPropertiesPlugin
} from '@/plugins'

import '@/assets/styles/main.scss'

const app = createApp(App)

app
  .use(store)
  .use(router)
  .use(PortalPlugin)
  .use(VueGlobalPropertiesPlugin)

router.isReady().then(() => {
  app.mount('#app')
})

export {
  app
}
