<template>
  <div
    v-show="cameraActive"
    class="absolute top-20 rounded-3xl overflow-hidden md:left-1/2 md:-translate-x-1/2 left-5 right-5"
  >
    <Camera
      ref="webcamRef" :resolution="{
        width: 640,
        height: 480
      }"
      :autoplay="false"
      facingMode="user"
      @started="onCameraStarted"
      @stopped="onCameraStopped"
    >
      <div class="flex gap-5 h-full justify-center items-end z-[999] p-5 relative">
        <el-button @click="toggleCamera">
          Stop Camera
        </el-button>

        <el-button @click="sendMessageModel.message+=signLanguageMessage">
          Save to input
        </el-button>

        <el-button @click="flip">
          Flip
        </el-button>
      </div>

      <canvas ref="canvasRef" class="w-full h-full absolute left-0 right-0 top-0" />
    </Camera>
  </div>

  <el-form
    ref="sendMessageFormRef"
    :model="sendMessageModel"
    class="md:border border-border-primary rounded-xl flex md:flex-col w-full md:pt-2 gap-2 md:gap-0"
    @submit.prevent
    @keyup.enter="submitMessage(sendMessageFormRef, messageFormItem)"
  >
    <el-form-item
      ref="messageFormItem"
      class="flex-1 m-0" prop="message"
    >
      <el-input
        ref="messageInputRef"
        v-model="sendMessageModel.message"
        class="message-input"
        placeholder="Write a message"
      />
    </el-form-item>

    <div
      class="flex justify-end bg-block-secondary gap-1
      md:p-3 md:flex-1 md:flex-row-reverse md:justify-between md:rounded-xl"
    >
      <el-button
        :type="$elComponentType.primary"
        :disabled="!isValid"
        @click="submitMessage(sendMessageFormRef, messageFormItem)"
      >
        {{ submitButtonText }}
      </el-button>

      <div class="flex gap-2">
        <el-button
          v-if="editMode"
          @click="cancelEdit"
        >
          Cancel
        </el-button>

        <el-button v-if="!cameraActive" @click="toggleCamera">SLD</el-button>
      </div>
    </div>
  </el-form>
</template>

<script lang="ts" setup>
import Camera from 'simple-vue-camera'

import type { PostgrestError } from '@supabase/supabase-js'

const modelUrl = 'https://tensorflowjsrealtimemodel.s3.au-syd.cloud-object-storage.appdomain.cloud/model.json'

const props = defineProps<{
  chatId: string
  senderId: string
}>()

const {
  webcamRef,
  canvasRef,
  cameraActive,
  signLanguageMessage,
  flip,
  toggleCamera,
  onCameraStarted,
  onCameraStopped
} = useCameraSignRecognition(modelUrl)

const chatStore = useChatStore()
const { currentChat, messages, messageToEdit } = storeToRefs(chatStore)

const messageFormItem = ref(null)
const messageInputRef = ref(null)

const editMode = computed(() => !!messageToEdit.value)
const submitButtonText = computed(() => editMode.value ? 'Edit' : 'Send')

const sendMessageFormRef = useElFormRef()
const sendMessageModel = useElFormModel({
  message: ''
})

const isValid = computed(() =>
  !!sendMessageModel.message.trim().length
)

function cancelEdit () {
  messageToEdit.value = null
}

async function sendMessage () {
  await chatService.createNewMessage({
    message: sendMessageModel.message,
    chat_id: props.chatId,
    sender_id: props.senderId
  })
}

async function createChat () {
  if (currentChat.value && !messages.value.length) {
    await chatService.createNewChat(currentChat.value?.chat_id,
      currentChat.value?.user_id,
      props.senderId)
  }
}

async function editMessage () {
  if (messageToEdit.value) {
    await chatService.editMessage({
      ...messageToEdit.value,
      message: sendMessageModel.message
    })

    cancelEdit()
  }
}

async function submitMessage (formRef, inputRef) {
  if (isValid.value) {
    try {
      if (editMode.value) {
        await editMessage()
      } else {
        await createChat()
        await sendMessage()
      }

      inputRef.resetField()
    } catch (err) {
      notificationHandler(errors.message[(err as PostgrestError).code] || (err as TAppError))
    }
  }
}

watch(messageToEdit, async (message) => {
  sendMessageModel.message = message?.message ?? ''
  messageInputRef.value?.focus()
})
</script>

<style lang="scss">
.message-input {
  @apply md:rounded-t-xl;

  .el-input__wrapper {
    @apply md:shadow-none md:border-b md:rounded-none  md:pb-2;
  }
}
</style>
