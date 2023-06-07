<template>
  <el-dialog
    :modelValue="modelValue"
    title="Delete Account"
    width="30%"
    align-center
    @open="$emit('update:modelValue', true)"
    @close="$emit('update:modelValue', false)"
  >
    <span>Are you sure you want to delete your account?</span>
    <template #footer>
      <span class="flex gap-5 justify-end">
        <el-button @click="closeModal">Cancel</el-button>
        <el-button :type="$elComponentType.danger" @click="deleteAccount">
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { routeNames } from '@/router/route-names'

const authStore = useAuthStore()
const { clearUser } = authStore
const { currentUser } = storeToRefs(authStore)

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue'])
const router = useRouter()

function closeModal () {
  emit('update:modelValue', false)
}

async function deleteAccount () {
  if (currentUser.value) {
    try {
      await settingsService.deleteAccount(currentUser.value?.id)
      clearUser()

      notificationHandler('Account deleted', {
        type: 'success'
      })

      router.replace({ name: routeNames.signUp })
    } catch (err) {
      notificationHandler(err as TAppError)
    }
  }

  emit('update:modelValue', true)
}
</script>
