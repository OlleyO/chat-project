<template>
  <div v-loading="loading" class="max-w-lg h-full m-auto flex items-center justify-center">
    <el-form
      ref="forgotPasswordRef"
      :model="forgotPasswordModel"
      :rules="forgotPasswordRules"
      class="flex flex-col justify-center border rounded-3xl px-20 py-10 shadow-md"
      label-position="top"
    >
      <h1 class="text-3xl mb-5">Forgot Password?</h1>

      <el-form-item class="mb-10" label="Recovery Email Address" prop="email">
        <el-input v-model.trim="forgotPasswordModel.email" />
      </el-form-item>

      <el-form-item>
        <div class="flex flex-1 justify-center">
          <el-button @click="submit(forgotPasswordRef)">Send Reset Email</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
const store = useAuthStore()
const { sendPasswordResetEmail } = store

const loading = ref(false)

const forgotPasswordRef = useElFormRef()
const forgotPasswordModel = useElFormModel<IForgotPasswordPayload>({
  email: ''
})
const forgotPasswordRules = useElFormRules({
  email: [useEmailRule(), useRequiredRule()]
})

function submit (formRef) {
  formRef.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        await sendPasswordResetEmail(forgotPasswordModel.email)

        notificationHandler('Check your email to reset password', { duration: 0, type: 'success' })
      } catch (err) {
        notificationHandler(err as TAppError)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>
