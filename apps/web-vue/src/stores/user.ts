import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Token, UserUpdate, WebResultUser } from '@ai-en/common/types/user'

export const useUserStore = defineStore(
  'user',
  () => {
    const user = ref<WebResultUser | null>(null)

    const clear = () => {
      user.value = null
    }

    const accessToken = computed(() => user.value?.token.accessToken)

    const refreshToken = computed(() => user.value?.token.refreshToken)

    const updateToken = (token: Token) => {
      if (!user.value) {
        return
      }
      user.value.token = token
    }

    const updateUser = (params: UserUpdate) => {
      if (!user.value) {
        return
      }
      user.value = { ...user.value, ...params }
    }

    return {
      user,
      clear,
      accessToken,
      refreshToken,
      updateToken,
      updateUser,
    }
  },
  { persist: true },
)
