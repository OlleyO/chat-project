<template>
  <el-drawer
    ref="drawer"
    :modelValue="modelValue"
    size="280px"
    :lock-scroll="false"
    :style="{top: '58px', position: 'fixed'}"
    class="shadow-2xl rounded-l-2xl border-l border-border-primary"
    :show-close="false"
    append-to-body
    close-on-click-modal
    @open="$emit('update:modelValue', true)"
    @close="$emit('update:modelValue', false)"
  >
    <template #header="{ close }">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <AppAvatar
            :size="24"
            :src="currentChat?.avatar_url"
            :fullname="currentChat?.fullname"
          />

          <span class="text-base font-semibold text-primary">{{ currentChat?.fullname }}</span>
        </div>

        <el-button text circle @click="close">
          <el-icon class="text-xl leading-none">
            <CloseCross />
          </el-icon>
        </el-button>
      </div>
    </template>

    <el-divider class="my-4" />

    <div class="flex flex-col gap-4 text-primary">
      <div class="flex flex-col gap-2">
        <span class="font-semibold text-sm">Username</span>

        <span class="text-sm">{{ currentChat?.tagname }}</span>
      </div>

      <div class="flex flex-col gap-2">
        <span class="font-semibold text-sm">Bio</span>

        <span class="text-sm">{{ currentChat?.bio }}</span>
      </div>
    </div>

    <el-divider class="my-4" />

    <div class="flex justify-between items-center">
      <span class="font-semibold text-sm text-primary">Notifications</span>

      <el-switch />
    </div>

    <el-divider class="my-4" />

    <div class="flex flex-col">
      <el-button
        class="justify-start"
        :type="$elComponentType.danger"
        text
        @click="$emit('openCreateReportForm', currentChat)"
      >
        Report User
      </el-button>

      <el-button
        class="justify-start"
        :type="$elComponentType.danger"
        text
        @click="$emit('deleteChat')"
      >
        Delete conversation
      </el-button>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import CloseCross from '@/components/icons/CloseCross.vue'

defineProps<{
  modelValue: boolean
  currentChat: TCurrentChat
}>()

const emit = defineEmits(['update:modelValue', 'deleteChat', 'openCreateReportForm'])

const drawer = ref(null)

onClickOutside(drawer, () => {
  emit('update:modelValue', false)
})

</script>
