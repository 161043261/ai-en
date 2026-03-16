<script lang="ts" setup>
import { getWordBookListApi } from '@/api/word-book'
import { type WordList, type WordQuery } from '@ai-en/common/types/word'
import { onMounted, ref } from 'vue'
import { Reading, VideoPlay } from '@element-plus/icons-vue'
import { ElIcon, ElInput, ElTag, ElPagination, ElCheckbox, ElButton } from 'element-plus'
import useAudio from '@/hooks/use-autio'

const total = ref<WordList['total']>(0)
const list = ref<WordList['list']>([])
const query = ref<WordQuery>({
  page: 1,
  pageSize: 10,
  word: '',
  gk: false,
  zk: false,
  gre: false,
  toefl: false,
  ielts: false,
  cet4: false,
  cet6: false,
  ky: false,
})

const getWordBookList = async () => {
  const res = await getWordBookListApi(query.value)
  if (res.ok) {
    total.value = res.data.total
    list.value = res.data.list
  }
}

onMounted(() => {
  getWordBookList()
})

const { playAudio } = useAudio()

const searchWord = () => {
  query.value.page = 1
  getWordBookList()
}
</script>

<template>
  <div
    class="mx-auto mt-10 w-300 rounded-[20px] bg-linear-to-br from-green-50 to-emerald-50 p-20 shadow-lg"
  >
    <div class="h-20">
      <div class="flex items-center gap-2">
        <ElIcon color="#16a34a" size="20">
          <Reading />
        </ElIcon>
        <span class="text-2xl font-bold text-gray-800">单词列表</span>
      </div>
      <div class="text-sm text-gray-600">
        词典来源：牛津、柯林斯、BNC、FRQ、高考、中考、GRE、TOEFL、IELTS、大学英语六级、大学英语四级、考研
      </div>
    </div>

    <div class="mb-10 flex items-center">
      <ElInput
        @keyup.enter="searchWord"
        class="mr-10"
        v-model="query.word"
        placeholder="请输入单词"
      />
      <ElCheckbox v-model="query.gk">高考</ElCheckbox>
      <ElCheckbox v-model="query.zk">中考</ElCheckbox>
      <ElCheckbox v-model="query.gre">GRE</ElCheckbox>
      <ElCheckbox v-model="query.toefl">TOEFL</ElCheckbox>
      <ElCheckbox v-model="query.ielts">IELTS</ElCheckbox>
      <ElCheckbox v-model="query.cet4">四级</ElCheckbox>
      <ElCheckbox v-model="query.cet6">六级</ElCheckbox>
      <ElCheckbox v-model="query.ky">考研</ElCheckbox>
      <ElButton @click="searchWord" class="ml-10" type="success">搜索</ElButton>
    </div>

    <div class="grid grid-cols-3 gap-2">
      <div
        class="h-55 cursor-pointer rounded-[10px] border border-green-200 bg-white p-4 text-gray-800 shadow-sm transition-all duration-200 hover:bg-green-50 hover:shadow-md"
        v-for="item in list"
        :key="item.id"
      >
        <div>
          <div class="mb-1 text-sm font-semibold text-green-600">{{ item.word }}</div>
          <div class="mb-1 flex items-center gap-2 text-sm text-gray-500">
            {{ item.phonetic }}
            <ElIcon size="18" color="#16a34a" @click="playAudio(item.word)">
              <VideoPlay />
            </ElIcon>
          </div>
          <div class="mb-1 line-clamp-2 overflow-hidden text-sm text-gray-700">
            {{ item.definition }}
          </div>
          <div
            v-html="item.translation"
            class="mb-1 line-clamp-2 overflow-hidden text-sm text-gray-600"
          />
          <div class="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <ElTag v-if="item.gk" type="success" size="small">高考</ElTag>
            <ElTag v-if="item.zk" type="success" size="small">中考</ElTag>
            <ElTag v-if="item.gre" type="success" size="small">GRE</ElTag>
            <ElTag v-if="item.toefl" type="success" size="small">TOEFL</ElTag>
            <ElTag v-if="item.ielts" type="success" size="small">IELTS</ElTag>
            <ElTag v-if="item.cet6" type="success" size="small">六级</ElTag>
            <ElTag v-if="item.cet4" type="success" size="small">四级</ElTag>
            <ElTag v-if="item.ky" type="success" size="small">考研</ElTag>
          </div>
        </div>
      </div>
      <ElPagination
        class="mt-10"
        background
        v-model:current-page="query.page"
        v-model:page-size="query.pageSize"
        :total="total"
        @current-change="getWordBookList"
        @size-change="getWordBookList"
      />
    </div>
  </div>
</template>
