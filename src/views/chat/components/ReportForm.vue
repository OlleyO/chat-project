<template>
  <el-dialog
    v-loading="loading"
    class="min-w-[300px] md:ml-[350px]"
    :modelValue="modelValue"
    title="Send report"
    append-to-body
    @open="$emit('update:modelValue', true)"
    @close="$emit('update:modelValue', false)"
  >
    <el-form
      ref="formRef"
      labelPosition="top"
      :model="formModel"
      :rules="formRules"
    >
      <el-form-item label="Reason" prop="reason">
        <el-input
          v-model="formModel.reason"
          type="textarea"
          rows="3"
          resize="none"
          placeholder="Report a problem"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex gap-2 justify-end">
        <el-button @click="closeForm">Cancel</el-button>

        <el-button type="primary" @click="submit(formRef)">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
const props = defineProps<{
  modelValue: boolean
  chat?: TCurrentChat
}>()

const emit = defineEmits(['update:modelValue', 'afterSubmit'])

const loading = ref(false)

const formRef = useElFormRef()
const formModel = useElFormModel({
  reason: ''
})
const formRules = useElFormRules({
  reason: [useMaxLenRule(25), useRequiredRule()]
})

function closeForm () {
  emit('update:modelValue', false)
}

async function sendReport () {
  await chatService.sendReport({
    ...formModel,
    user_id: props.chat?.user_id
  })

  emit('afterSubmit')
}

function submit (formRef) {
  formRef.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        await sendReport()
        notificationHandler('Report send. Your submission is processing', {
          type: 'success'
        })

        formRef.resetFields()
      } catch (err) {
        notificationHandler(err as TAppError)
      } finally {
        loading.value = false
        closeForm()
      }
    }
  })
}
</script>
