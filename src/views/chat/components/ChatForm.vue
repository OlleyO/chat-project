<template>
  <el-dialog
    v-loading="loading"
    class="min-w-[300px] md:ml-[350px]"
    :modelValue="modelValue"
    title="Create Group"
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
      <el-form-item label="Group name">
        <el-input />
      </el-form-item>
      <el-form-item label="Description">
        <el-input />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="flex gap-2 justify-end">
        <el-button @click="closeForm">Cancel</el-button>
        <el-button type="primary" @click="submit">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
const props = defineProps<{
  modelValue: boolean
  creatorId: string
}>()

const loading = ref(false)

const emit = defineEmits(['update:modelValue'])

const formRef = useElFormRef()
const formModel = useElFormModel({
  name: '',
  description: '',
  type: 'group'
})
const formRules = useElFormRules({
  name: [useMinLenRule(3), useRequiredRule(), useMaxLenRule(10)],
  description: [useMaxLenRule(25)]
})

function closeForm () {
  emit('update:modelValue', false)
}

async function createChat () {
  await chatService.createNewGroup()
}

function submit (formRef) {
  formRef.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
      } catch (err) {
        console.log(err)
      } finally {
        loading.value = false
        closeForm()
      }
    }
  })
}
</script>
