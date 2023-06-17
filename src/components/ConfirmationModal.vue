<template>
  <el-dialog
    :modelValue="modelValue"
    :title="title"
    :appendToBody="appendToBody"
    width="30%"
    align-center
    @open="$emit('update:modelValue', true)"
    @close="$emit('update:modelValue', false)"
  >
    <span>{{ helperText }}</span>

    <template #footer>
      <span class="flex gap-5 justify-end">
        <el-button @click="closeModal">Cancel</el-button>

        <el-button
          :type="$elComponentType.danger"
          @click="confirm"
        >
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
defineProps<{
  modelValue: boolean
  title: string
  helperText: string
  appendToBody?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'confirm'])

function closeModal () {
  emit('update:modelValue', false)
}

async function confirm () {
  emit('confirm')
  closeModal()
}
</script>
