<template>
  <div
    v-loading="loading"
    class="max-w-lg h-full m-auto flex items-center justify-center"
  >
    <el-form
      ref="resetPasswordRef"
      :model="resetPasswordModel"
      :rules="resetPasswordRules"
      class="flex flex-col justify-center border rounded-3xl px-20 py-10 shadow-md"
      label-position="top"
    >
      <h1 class="text-3xl mb-5">Reset Password</h1>

      <el-form-item class="mb-10" label="New Password" prop="password">
        <el-input v-model.trim="resetPasswordModel.password" show-password />
      </el-form-item>

      <el-form-item>
        <div class="flex flex-1 justify-center">
          <el-button @click="submit(resetPasswordRef)">Reset Password</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { routeNames } from '@/router/route-names'

const router = useRouter()

const store = useAuthStore()
const { resetPassword } = store

const loading = ref(false)

const resetPasswordRef = useElFormRef()
const resetPasswordModel = useElFormModel<IResetPasswordPayload>({
  password: ''
})
const resetPasswordRules = useElFormRules({
  password: [useMinLenRule(6), useRequiredRule()]
})

function submit (formRef) {
  formRef.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        await resetPassword(resetPasswordModel.password)
        notificationHandler('Successfully reset password', { duration: 2000, type: 'success' })
        router.replace({ name: routeNames.login })
      } catch (err) {
        notificationHandler(err as TAppError)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>
