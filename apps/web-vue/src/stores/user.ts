import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { WebResultUser } from '@ai-en/common/types/user'

export const useUserStore = defineStore(
  'user',
  () => {
    const user = ref<WebResultUser | null>(null)

    const clear = () => {
      user.value = null
    }

    return {
      user,
      set setUser(value: WebResultUser) {
        user.value = value
      },
      get getUser() {
        return user.value
      },
      clear,
    }
  },
  { persist: true },
)
