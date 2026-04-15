<script setup lang="ts">
import {
  Sunny,
  Star,
  Notebook,
  MagicStick,
  Reading,
  Setting,
  Compass,
} from '@element-plus/icons-vue'
import {
  ElIcon,
  ElPopover,
  ElButton,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
} from 'element-plus'
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import Profile from '@/layout/profile/index.vue'
import useAvatar from '@/hooks/use-avatar'
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n()
const { avatar } = useAvatar()

const handleLangCommand = (command: string) => {
  locale.value = command
}

const router = useRouter()
const currentPath = ref('')
const routes = computed(() => [
  { path: '/', name: t('nav.home'), icon: Compass },
  { path: '/smart/chat', name: t('nav.ai'), icon: MagicStick },
  { path: '/word-book/index', name: t('nav.wordBook'), icon: Notebook },
  { path: '/courses/index', name: t('nav.course'), icon: Reading },
  { path: '/settings/index', name: t('nav.settings'), icon: Setting },
])

watch(
  () => router.currentRoute.value,
  (newVal) => {
    currentPath.value = newVal.path
  },
  {
    immediate: true,
  },
)

const userStore = useUserStore()
const { user } = storeToRefs(userStore)
</script>

<template>
  <header
    class="sticky top-0 z-10 flex h-20 items-center justify-center border-b border-gray-200 bg-white"
  >
    <div class="mx-auto flex w-300 items-center justify-between">
      <div
        class="bg-primary flex h-10 w-10 items-center justify-center rounded-[10px] px-2 py-1 text-xl font-bold text-white"
      >
        EN
      </div>
      <div class="text-2xl font-bold">English App</div>

      <template v-for="route of routes" :key="route.path">
        <div
          @click="router.push(route.path)"
          :class="
            currentPath === route.path
              ? 'bg-green-200 text-green-700'
              : 'text-gray-500 hover:bg-green-200 hover:text-green-700'
          "
          class="flex cursor-pointer items-center gap-2 rounded-[10px] px-2 py-1"
        >
          <ElIcon>
            <component :is="route.icon" />
          </ElIcon>
          <span>{{ route.name }}</span>
        </div>
      </template>
      <div class="flex items-center gap-2 rounded-full bg-blue-200 px-2 py-1 text-blue-700">
        <ElIcon>
          <Sunny />
        </ElIcon>
        <span class="text-sm font-bold">{{ user?.wordNumber ?? 0 }}</span>
      </div>
      <div class="flex items-center gap-2 rounded-full bg-amber-200 px-2 py-1 text-amber-500">
        <ElIcon>
          <Star />
        </ElIcon>
        <span class="text-sm font-bold">{{ user?.dayNumber ?? 0 }}</span>
      </div>

      <!-- Language Switcher -->
      <ElDropdown @command="handleLangCommand" trigger="click">
        <ElButton round>
          {{ locale === 'zh' ? '中' : 'EN' }}
        </ElButton>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem command="zh" :disabled="locale === 'zh'">简体中文</ElDropdownItem>
            <ElDropdownItem command="en" :disabled="locale === 'en'">English</ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>

      <ElPopover width="calc(20rem + 26px)">
        <template #reference>
          <div class="flex cursor-pointer items-center gap-2 border-l border-gray-200 pl-4">
            <img class="mr-2 ml-2 h-10 w-10 rounded-full" :src="avatar" />
            <span class="text-sm font-bold">{{ user?.name ?? 'Anonymous' }}</span>
          </div>
        </template>
        <Profile />
      </ElPopover>
    </div>
  </header>
</template>
