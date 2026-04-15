<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import useAvatar from '@/hooks/use-avatar'
import useLogin from '@/hooks/use-login'
import { ElMessageBox } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { login, logout } = useLogin()
const { avatar } = useAvatar()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const isLoggedIn = computed(() => !!user.value)
const router = useRouter()
const bio = computed(() => user.value?.bio ?? '')
const displayName = computed(() => user.value?.name ?? t('profile.anonymous'))

const handleLogout = () => {
  ElMessageBox.confirm(t('profile.logoutConfirm'), t('settings.messages.logoutConfirmTitle'), {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning',
  }).then(logout)
}
</script>

<template>
  <section
    class="w-80 overflow-hidden rounded-[14px] bg-linear-to-b from-white/95 to-slate-50/95 backdrop-blur"
    aria-label="用户资料"
  >
    <div class="flex items-center gap-3 px-4 pt-3.5 pb-3">
      <div class="grid size-11 shrink-0 place-items-center rounded-full border border-gray-200">
        <img class="size-10 rounded-full object-cover" :src="avatar" loading="lazy" />
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex min-w-0 items-center gap-2">
          <div class="flex flex-col gap-1">
            <div
              class="truncate text-sm leading-5 font-extrabold text-slate-900"
              :title="displayName"
            >
              {{ displayName }}
            </div>
            <div v-if="bio" class="truncate text-xs leading-4 text-slate-500/90" :title="bio">
              {{ bio }}
            </div>
          </div>
        </div>
        <div v-if="!isLoggedIn" class="mt-1 text-xs leading-4 text-slate-500/90">
          {{ t('profile.loginTip') }}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-2.5 px-4 pt-2 pb-3" v-if="isLoggedIn">
      <div class="rounded-xl border border-slate-900/5 bg-white/65 px-2.5 py-2.5">
        <div class="text-xs leading-4 text-slate-500/95">{{ t('profile.wordCount') }}</div>
        <div class="mt-1 text-lg leading-5.5 font-black text-slate-900">
          {{ user?.wordNumber ?? 0 }}
        </div>
      </div>
      <div class="rounded-xl border border-amber-500/20 bg-amber-50/90 px-2.5 py-2.5">
        <div class="text-xs leading-4 text-slate-500/95">{{ t('profile.dayCount') }}</div>
        <div class="mt-1 text-lg leading-5.5 font-black text-slate-900">
          {{ user?.dayNumber ?? 0 }}
        </div>
      </div>
    </div>

    <div class="flex gap-2.5 border-t border-slate-900/5 bg-white/75 px-4 pt-3 pb-3.5">
      <button
        v-if="!isLoggedIn"
        class="h-9 flex-1 cursor-pointer rounded-[10px] border border-green-600/25 bg-green-600/10 text-[13px] font-extrabold text-green-500 transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_10px_16px_rgba(15,23,42,0.10)] active:translate-y-0 active:shadow-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none"
        type="button"
        @click="login"
      >
        {{ t('profile.goLogin') }}
      </button>
      <template v-else>
        <button
          class="h-9 flex-1 cursor-pointer rounded-[10px] border border-slate-900/10 bg-white/90 text-[13px] font-extrabold text-slate-900/90 transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_10px_16px_rgba(15,23,42,0.10)] active:translate-y-0 active:shadow-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none"
          type="button"
          @click="router.push('/settings/index')"
        >
          {{ t('profile.personalData') }}
        </button>
        <button
          class="h-9 flex-1 cursor-pointer rounded-[10px] border border-red-500/20 bg-red-500/10 text-[13px] font-extrabold text-red-500 transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_10px_16px_rgba(15,23,42,0.10)] active:translate-y-0 active:shadow-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none"
          type="button"
          @click="handleLogout"
        >
          {{ t('profile.logout') }}
        </button>
      </template>
    </div>
  </section>
</template>
