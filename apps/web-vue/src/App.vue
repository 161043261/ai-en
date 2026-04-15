<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import { RouterView } from 'vue-router'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useCssVar } from '@vueuse/core'
import { onMounted, provide, ref } from 'vue'
import Search from '@/components/search/index.vue'
import Auth from '@/components/auth/index.vue'
import { IS_SHOW_AUTH } from './components/auth/types'

const setGreenTheme = () => {
  const el = document.documentElement

  useCssVar('--el-color-primary', el).value = '#00a63e'
  useCssVar('--el-color-primary-light-3', el).value = '#008235'
  useCssVar('--el-color-primary-light-5', el).value = '#00c950'
  useCssVar('--el-color-primary-light-7', el).value = '#7bf1a7'
  useCssVar('--el-color-primary-light-8', el).value = '#b9f8cf'
  useCssVar('--el-color-primary-light-9', el).value = '#dcfce7'
  useCssVar('--el-color-primary-dark-2', el).value = '#026630'
}

onMounted(setGreenTheme)
provide(IS_SHOW_AUTH, ref(false))
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <RouterView />
    <Auth />
    <Search />
  </ElConfigProvider>
</template>
