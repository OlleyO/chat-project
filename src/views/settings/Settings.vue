<template>
  <div
    v-loading="loading"
    class="h-full"
  >
    <header class="flex justify-between shadow-lg mb-12 px-2 py-5">
      <AppLogo class="flex items-center" />

      <div class="flex items-center gap-4">
        <el-button :type="$elComponentType.primary" @click="$router.push({ name: $routeNames.chat })">Home</el-button>

        <LogOutButton class="py-5" />
      </div>
    </header>

    <div class="max-w-2xl mx-auto px-2">
      <el-form
        ref="profileFormRef" hide-required-asterisk :model="profileModel" :rules="profileFormRules"
        class="flex flex-col border rounded-3xl bg-gray-100 backdrop-blur-lg px-10 py-10"
        label-position="top"
      >
        <div class="flex-col sm:flex-row flex justify-between sm:gap-16 items-center">
          <el-form-item prop="avatar_url">
            <template #label>
              <label
                for="avatar"
                class="cursor-pointer relative overflow-hidden rounded-full"
              >
                <el-avatar
                  class="cursor-pointer avatar-photo"
                  :size="120" fit="cover" :src="profileModel.avatar_url"
                />

                <div
                  class="text-xs text-white text-center
                     absolute bottom-0 rounded-full
                     bg-gray-900
                     bg-opacity-60 backdrop-blur-lg w-full py-2"
                >
                  Upload
                </div>
              </label>
            </template>

            <input id="avatar" class="hidden" type="file" @change="onFileChange">
          </el-form-item>

          <el-form-item
            class="w-full sm:w-auto flex-1"
            label="Username"
            prop="username"
          >
            <el-input v-model="profileModel.username" />
          </el-form-item>
        </div>

        <el-form-item label="Fullname" prop="fullname">
          <el-input v-model="profileModel.fullname" />
        </el-form-item>

        <el-form-item label="Email" prop="email">
          <el-input v-model="profileModel.email" />
        </el-form-item>

        <el-form-item label="Bio" prop="bio">
          <el-input
            v-model="profileModel.bio"
            type="textarea"
            rows="3"
            resize="none"
            placeholder="Tell more about yourself"
          />
        </el-form-item>

        <router-link class="text-sm text-link-primary mb-5" :to="{ name: $routeNames.forgotPassword }">
          Reset password
        </router-link>

        <div class="flex justify-between gap-5">
          <el-button :type="$elComponentType.danger" @click="deleteAccountModalVisible = true">
            Delete Account
          </el-button>

          <el-button :type="$elComponentType.primary" :disabled="!changesApplied" @click="submit(profileFormRef)">
            Save
          </el-button>
        </div>
      </el-form>
    </div>
    <DeleteAccountModal v-model="deleteAccountModalVisible" />
  </div>
</template>

<script lang="ts" setup>
import { settingsService } from './settings.service'

import DeleteAccountModal from './components/DeleteAccountModal.vue'

const authStore = useAuthStore()
const { currentUser } = storeToRefs(authStore)

const loading = ref(false)
const deleteAccountModalVisible = ref(false)

const profileFormRef = useElFormRef()
const profileModel = useElFormModel<IProfile>({
  // Do not create type for auth table,
  // because it can cause system vulnerability
  ...currentUser.value?.user_metadata as any,
  email: currentUser.value?.email,
  avatar_file: null
})

const profileFormRules = useElFormRules({
  email: [useEmailRule(), useRequiredRule()],
  fullname: [useMinLenRule(5), useMaxLenRule(25), useRequiredRule()],
  username: [useMinLenRule(5), useMaxLenRule(25), useRequiredRule()],
  bio: [useMaxLenRule(25)]
})

const changesApplied = computed(() => {
  if (currentUser.value) {
    return Object.keys(profileModel).some(
      (key) => {
        console.log(key)
        console.log(profileModel[key] !== currentUser.value?.user_metadata[key])

        if (currentUser.value?.user_metadata[key] === undefined) {
          return false
        }

        return profileModel[key] !== currentUser.value?.user_metadata[key]
      }) ||
       currentUser.value.email !== profileModel.email ||
       !!profileModel.avatar_file
  }
})

async function onFileChange (e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) {
    const userFile = target.files[0]
    const arrayBuffer = await userFile.arrayBuffer()
    const fileToUpload = new File([arrayBuffer],
      `${currentUser.value?.id}_${new Date().getTime()}`, {
        type: userFile.type
      })

    profileModel.avatar_file = fileToUpload
    profileModel.avatar_url = URL.createObjectURL(fileToUpload)
  }
}

function submit (formRef) {
  formRef.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        let avatarUrl = ''

        if (profileModel.avatar_file) {
          const pathToImage = currentUser.value?.user_metadata.avatar_url?.split('images/')[1]

          const [{ path }] = await Promise.all([settingsService.uploadAvatar(profileModel.avatar_file),
            settingsService.deleteAvatar(pathToImage)])

          avatarUrl = (await settingsService.getAvatarUrl(path)).publicUrl

          URL.revokeObjectURL(profileModel.avatar_url)
        }

        await settingsService.updateProfile({
          ...profileModel,
          avatar_url: avatarUrl || profileModel.avatar_url
        })

        profileModel.avatar_file = null
        profileModel.avatar_url = avatarUrl || profileModel.avatar_url

        notificationHandler('Profile updated', {
          type: 'success'
        })
      } catch (err) {
        notificationHandler(err as TAppError)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss">
.avatar-photo {
  img {
    flex: 1;
  }
}
</style>
