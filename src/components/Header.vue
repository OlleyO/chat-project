<template>
  <header
    class="header fixed top-0 left-0 md:left-[240px]
      lg:left-[320px] right-0 flex px-1 md:px-6 items-center justify-between h-14"
  >
    <el-button class="md:hidden text-2xl leading-none" text :icon="BurgerMenu" @click="emit('onMenuClick')" />

    <div class="flex gap-20 items-center">
      <AppLogo class="hidden md:flex items-center" />
      <p class="font-semibold text-sm text-primary">
        {{ currentChat?.fullname }}
      </p>
    </div>

    <div class="flex items-center self-stretch">
      <el-button
        class="h-full header-button px-2 text-2xl leading-none"
        :icon="Dots"
        text
        @click="emit('onInfoClick')"
      />

      <el-dropdown trigger="click">
        <span class="el-dropdown-link">
          <el-button
            class="h-full header-button px-2 text-xl leading-none"
            :icon="Gear"
            text
          />
        </span>

        <template #dropdown>
          <el-dropdown-menu class="bg-block-primary rounded-3xl" placement="bottom-start">
            <el-dropdown-item>
              <el-button text @click="$router.push({name: $routeNames.settings})">
                Settings
              </el-button>
            </el-dropdown-item>

            <el-dropdown-item>
              <LogOutButton />
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <div class="hidden px-2 h-full md:flex items-center">
        <AppAvatar
          :size="32"
          :src="currentUser?.user_metadata.avatar_url"
          :fullname="currentUser?.user_metadata.fullname"
        />
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
import type { User } from '@supabase/supabase-js'

import BurgerMenu from '@/components/icons/BurgerMenu.vue'
import Dots from '@/components/icons/Dots.vue'
import Gear from '@/components/icons/Gear.vue'

defineProps<{
  currentChat: TCurrentChat
  currentUser: User | null
}>()

const emit = defineEmits(['onMenuClick', 'onInfoClick'])
</script>

<style lang="scss">
.header {
  box-shadow: 0px 1px 2px rgba(2, 17, 37, 0.12);
}
</style>
