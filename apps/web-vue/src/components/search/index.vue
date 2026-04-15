<script lang="ts" setup>
import { ElIcon, ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { customRef, ref, useTemplateRef } from 'vue'
import { type Word } from '@ai-en/common/types/word'
import DOMPurify from 'dompurify'
import { getWordBookListApi } from '@/api/word-book'
import { onClickOutside } from '@vueuse/core'
import vFocus from '@/hooks/v-focus'

const sanitizeHtml = (html: string | undefined) => {
  if (!html) {
    return ''
  }
  return DOMPurify.sanitize(html)
}

const wordList = ref<Word[]>([])

const isShow = ref(false)

const searchContainerRef = useTemplateRef<HTMLDivElement>('search-container')

onClickOutside(searchContainerRef, () => {
  if (isShow.value) {
    isShow.value = false
    search.value = ''
    document.body.style.overflow = 'auto'
  }
})

let timer: ReturnType<typeof setTimeout> | null = null

// @change 失去焦点时触发
// @input 输入时触发

// const search = ref('')

// watch(() => search.value, () => {
//   if (timer) {
//     clearTimeout(timer)
//   }
//   timer = setTimeout(() => {
//     getList()
//   }, 500)
// })

// 通常
// track() 应该在 get() 中调用
// trigger() 应该在 set() 中调用
const search = customRef((track, trigger) => {
  let value = ''
  return {
    get() {
      track() // 依赖收集（订阅）
      return value
    },
    set(newValue: string) {
      value = newValue
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        getList()
        trigger() // 触发更新（发布）
      }, 500)
    },
  }
})

const getList = async () => {
  const { data: res } = await getWordBookListApi({ word: search.value, page: 1, pageSize: 20 })
  if (res.ok) {
    wordList.value = res.data.list
  }
}

const copyWord = (word: string) => {
  try {
    navigator.clipboard.writeText(word) //localhost  / https
    ElMessage.success('复制成功')
  } catch (err) {
    console.error(err)
    ElMessage.error('复制失败')
  }
}

window.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'f' && e.ctrlKey) {
    e.preventDefault()
    isShow.value = true
    document.body.style.overflow = 'hidden'
  }
  if (e.key === 'Escape') {
    isShow.value = false
    search.value = ''
    document.body.style.overflow = 'auto'
  }
})
</script>

<template>
  <div v-if="isShow" class="fixed inset-0 z-40 h-full w-full bg-black opacity-30 blur-sm" />
  <Transition name="fade">
    <div v-if="isShow" class="fixed inset-0 z-50 flex justify-center pt-20 shadow-lg">
      <div ref="search-container" class="w-1/2">
        <div
          :class="
            wordList.length > 0 ? 'rounded-tl-[0.625em] rounded-tr-[0.625em]' : 'rounded-[0.625em]'
          "
          class="flex items-center gap-2 bg-white p-3 shadow-lg"
        >
          <ElIcon size="20">
            <Search />
          </ElIcon>
          <input
            v-focus
            placeholder="搜索"
            type="text"
            v-model="search"
            class="h-full w-full rounded-lg border-none p-2 text-sm focus:outline-none"
          />
        </div>
        <div
          v-if="wordList.length > 0"
          class="max-h-125 w-full overflow-y-auto border-t border-gray-200"
        >
          <div
            @click="copyWord(item.word)"
            v-for="item in wordList"
            :key="item.id"
            class="cursor-pointer bg-white p-4 text-gray-800 shadow-sm hover:bg-green-50 hover:shadow-md"
          >
            <div class="mb-1 text-sm font-semibold text-green-600">{{ item.word }}</div>
            <div
              v-html="sanitizeHtml(item.translation)"
              class="mb-1 line-clamp-2 overflow-hidden text-sm text-gray-700"
            />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style lang="css" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
