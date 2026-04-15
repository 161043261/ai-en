<script setup lang="ts">
import ModelViewer from './model-viewer/index.vue'
import LoginForm from './login-form/index.vue'
import RegisterForm from './register-form/index.vue'
import { ref, inject } from 'vue'
import { IS_SHOW_AUTH } from './types'
import type { AuthType } from './types'
import { useI18n } from 'vue-i18n'
import useLogin from '@/hooks/use-login'
const { hide } = useLogin()

const { t } = useI18n()
const isShowAuth = inject(IS_SHOW_AUTH, ref(false))
const AuthType = ref<AuthType>('login')

const changeAuthType = (url: AuthType) => {
  AuthType.value = url
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    isShowAuth.value = false
  }
})
</script>

<template>
  <div
    v-if="isShowAuth"
    class="fixed inset-0 z-40 bg-black opacity-30 blur-sm filter"
    @click="hide"
  />
  <Transition name="fade">
    <div v-if="isShowAuth" class="fixed inset-30 z-50 flex items-center justify-center">
      <div class="flex h-175 w-300 overflow-hidden rounded-[20px] bg-white shadow-2xl">
        <!-- 左侧 3D 模型区域 -->
        <ModelViewer @changeAuthType="changeAuthType" ref="modelViewerRef" />

        <!-- 右侧登录表单区域 -->
        <div class="flex flex-1 flex-col justify-center bg-white px-12 py-10">
          <LoginForm v-if="AuthType === 'login'" />
          <RegisterForm v-if="AuthType === 'register'" />
          <div class="mt-6 text-center">
            <div class="flex items-center justify-center gap-4 text-sm text-gray-500">
              <span class="cursor-pointer transition-colors hover:text-green-600">{{
                t('auth.login.forgotPassword')
              }}</span>
              <!-- <span class="text-gray-300">|</span> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
