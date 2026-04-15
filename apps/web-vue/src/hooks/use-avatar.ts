import defaultAvatar from '@/assets/images/avatar.svg'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { AppConfig } from '@ai-en/common/config'

const UPLOAD_URL = import.meta.env.DEV
  ? `http://${AppConfig.hosts.minio}:${AppConfig.ports.minio}`
  : `http://${AppConfig.hosts.minio}:${AppConfig.ports.minio}`

function useAvatar() {
  const userStore = useUserStore()
  const { user } = storeToRefs(userStore)

  const avatar = computed(() => {
    if (user.value?.avatar) {
      return UPLOAD_URL + user.value.avatar
    } else {
      return defaultAvatar
    }
  })

  const customAvatar = (avatar: string) => {
    if (avatar) {
      return UPLOAD_URL + avatar
    } else {
      return defaultAvatar
    }
  }
  return {
    avatar,
    customAvatar,
  }
}

export default useAvatar
