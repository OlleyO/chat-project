<template>
  <el-dialog v-if="shown" title="Install the App" width="30%">
    <span>Press install to intall PWA to your device</span>

    <template #footer>
      <div class="flex justify-between">
        <button @click="installPWA">
          Install
        </button>

        <button @click="dismissPrompt">
          No, thanks
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
const shown = ref(false)
const installEvent = ref<any>(null)

function dismissPrompt () {
  shown.value = false
}

async function installPWA () {
  installEvent.value?.prompt()
  installEvent.value.userChoice.then((choice) => {
    dismissPrompt() // Hide the prompt once the user's clicked

    if (choice.outcome === 'accepted') {
      // Do something additional if the user chose to install
    } else {
      // Do something additional if the user declined
    }
  })
}

onBeforeMount(() => {
  console.log('here')
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    installEvent.value = e
    shown.value = true
  })
})
</script>
