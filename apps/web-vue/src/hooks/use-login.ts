import { IS_SHOW_AUTH } from '@/components/auth/types'
import { inject, ref } from 'vue'
import { useUserStore } from '@/stores/user'

export const useLogin = () => {
  const isShowAuth = inject(IS_SHOW_AUTH, ref(false))
  const userStore = useUserStore()

  const login = () => {
    return new Promise((resolve, reject) => {
      if (userStore.getUser) {
        resolve(true) // 用户已登录
      } else {
        isShowAuth.value = true // 显示登录弹窗
        reject(false)
      }
    })
  }

  const hide = () => {
    isShowAuth.value = false
  }

  return {
    login,
    hide,
  }
}
