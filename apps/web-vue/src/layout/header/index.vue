<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import {
  Sunny,
  Star,
  Notebook,
  MagicStick,
  Reading,
  Setting,
  User,
  Compass,
} from '@element-plus/icons-vue'
import { ElIcon } from 'element-plus'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentPath = ref('')
const routes = [
  { path: '/', name: '主页', icon: Compass },
  { path: '/smart/chat', name: 'AI', icon: MagicStick },
  { path: '/word-book/index', name: '词典', icon: Notebook },
  { path: '/courses/index', name: '课程', icon: Reading },
  { path: '/setting/index', name: '设置', icon: Setting },
]

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
        <span class="text-sm font-bold">{{ userStore.getUser?.wordNumber ?? 0 }}</span>
      </div>
      <div class="flex items-center gap-2 rounded-full bg-amber-200 px-2 py-1 text-amber-500">
        <ElIcon>
          <Star />
        </ElIcon>
        <span class="text-sm font-bold">{{ userStore.getUser?.dayNumber ?? 0 }}</span>
      </div>
      <div class="flex cursor-pointer items-center gap-2 border-l border-gray-200 pl-4">
        <ElIcon class="mr-2 ml-2 h-10 w-10 rounded-full">
          <User />
        </ElIcon>
        <span class="text-sm font-bold">{{ userStore.getUser?.name ?? '未登录' }}</span>
      </div>
    </div>
  </header>
</template>
