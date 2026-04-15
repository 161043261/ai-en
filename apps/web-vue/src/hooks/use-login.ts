import { IS_SHOW_AUTH } from '@/components/auth/types'
import { inject, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import router from '@/router'

function useLogin() {
  const isShowAuth = inject(IS_SHOW_AUTH, ref(false))
  const userStore = useUserStore()

  const login = () => {
    if (userStore.user) {
      return true // 用户已登录
    } else {
      isShowAuth.value = true // 显示登录弹窗
      return false
    }
  }

  const hide = () => {
    isShowAuth.value = false
  }

  const logout = () => {
    userStore.clear()
    router.push('/')
  }

  return {
    login,
    hide,
    logout,
  }
}

export default useLogin
