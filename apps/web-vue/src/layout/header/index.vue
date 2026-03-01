<script setup lang="ts">
import {
  Sunny,
  Star,
  HomeFilled,
  Notebook,
  MagicStick,
  Reading,
  Setting,
  User,
} from '@element-plus/icons-vue'
import { ElIcon } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <header
    class="flex items-center h-20 border-b border-gray-200 justify-center sticky top-0 bg-white z-10"
  >
    <div class="w-300 mx-auto flex items-center justify-between">
      <div
        class="text-xl font-bold bg-purple-700 text-white rounded-[10px] px-2 py-1 w-10 flex items-center justify-center h-10"
      >
        Eng
      </div>
      <div class="text-2xl font-bold">English App</div>
      <div
        @click="router.push('/')"
        class="flex items-center gap-2 cursor-pointer rounded-[10px] px-2 py-1 text-gray-500"
      >
        <ElIcon>
          <HomeFilled />
        </ElIcon>
        <span>主页</span>
      </div>
      <div
        @click="router.push('/smart/chat')"
        class="flex items-center gap-2 cursor-pointer text-gray-500"
      >
        <ElIcon>
          <MagicStick />
        </ElIcon>
        <span>AI</span>
      </div>
      <div
        @click="router.push('/word-book/index')"
        class="flex items-center gap-2 cursor-pointer text-gray-500"
      >
        <ElIcon>
          <Notebook />
        </ElIcon>
        <span>词库</span>
      </div>
      <div
        @click="router.push('/courses/index')"
        class="flex items-center gap-2 cursor-pointer text-gray-500"
      >
        <ElIcon>
          <Reading />
        </ElIcon>
        <span>课程</span>
      </div>
      <div
        @click="router.push('/setting/index')"
        class="flex items-center gap-2 cursor-pointer text-gray-500"
      >
        <ElIcon>
          <Setting />
        </ElIcon>
        <span>设置</span>
      </div>
      <div class="flex items-center gap-2 bg-blue-200 text-blue-700 rounded-full px-2 py-1">
        <ElIcon>
          <Sunny />
        </ElIcon>
        <span class="font-bold text-sm">{{ 0 }}</span>
      </div>
      <div class="flex items-center gap-2 bg-amber-200 text-amber-700 rounded-full px-2 py-1">
        <ElIcon>
          <Star />
        </ElIcon>
        <span class="font-bold text-sm">{{ 0 }}</span>
      </div>
      <div class="flex items-center gap-2 border-l cursor-pointer border-gray-200 pl-4">
        <ElIcon class="w-10 h-10 rounded-full ml-2 mr-2">
          <User />
        </ElIcon>
        <span class="text-sm font-bold">{{ '未登录' }}</span>
      </div>
    </div>
  </header>
</template>
