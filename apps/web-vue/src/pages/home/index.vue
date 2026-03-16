<script setup lang="ts">
import { Cpu, DataBoard, Microphone } from '@element-plus/icons-vue'
import Hologram from './components/hologram/index.vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { onMounted, reactive, type Component } from 'vue'
import { ElIcon } from 'element-plus'
import clsx from 'clsx'

gsap.registerPlugin(ScrollTrigger)

const stats = reactive<
  {
    value: number
    suffix: string
    label: string
    target: number
  }[]
>([
  { value: 0, suffix: '+', label: '学员数量', target: 1000_000 },
  { value: 0, suffix: '+', label: '课程数量', target: 500 },
  { value: 0, suffix: '%', label: '学员满意度', target: 98 },
  { value: 0, suffix: '+', label: '学习时长 (小时)', target: 5000_000 },
])

const classNames = {
  cardsContainer: 'cards-container',
  aboutCard: 'about-card',
  textWhy: 'text-why',
  textWhyContent: 'text-why-content',
  textCore: 'text-core',
  textCoreTitle: 'text-core-title',
  textCoreContent: 'text-core-content',
}

const aboutList: {
  icon: Component
  title: string
  content: string
}[] = [
  {
    icon: DataBoard,
    title: 'AI 沉浸学习',
    content: '沉浸式场景，在英文环境中学习英语，告别机械式背诵',
  },
  {
    icon: Microphone,
    title: '智能对话练习',
    content: 'AI 实时反馈，个性化陪伴对话，随时随地练习口语',
  },
  {
    icon: Cpu,
    title: '科学单词记忆',
    content: '基于艾宾浩斯遗忘曲线，制定复习计划，确保单词持久化记忆',
  },
]

const initProject = () => {
  // 数字过渡
  stats.forEach((item) => {
    gsap.to(item, {
      value: item.target, // 目标值
      duration: 2, // 持续时间
      ease: 'power2.inOut', // 过渡动画
    })
  })

  // 卡片过渡
  const cards = gsap.utils.toArray(`.${classNames.aboutCard}`) as HTMLElement[]
  cards.forEach((card, index) => {
    gsap.fromTo(
      card,
      { opacity: 0, y: 40, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        delay: index * 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: `.${classNames.cardsContainer}`,
          start: 'top 75%',
        },
      },
    )
  })

  // 文字过渡
  gsap.fromTo(`.${classNames.textWhy}`, { opacity: 0, y: 60 }, { opacity: 1, y: 0 })

  gsap.fromTo(`.${classNames.textWhyContent}`, { opacity: 0, y: 60 }, { opacity: 1, y: 0 })

  gsap.fromTo(
    `.${classNames.textCore}`,
    { opacity: 0, y: 60 },
    {
      opacity: 1,
      y: 0,
      scrollTrigger: { trigger: '.text-core', start: 'top 70%' },
    },
  )

  gsap.fromTo(
    `.${classNames.textCoreTitle}`,
    { opacity: 0, y: 60 },
    {
      opacity: 1,
      y: 0,
      scrollTrigger: { trigger: `.${classNames.textCoreTitle}`, start: 'top 70%' },
    },
  )

  gsap.fromTo(
    `.${classNames.textCoreContent}`,
    { opacity: 0, y: 60 },
    {
      opacity: 1,
      y: 0,
      scrollTrigger: { trigger: `.${classNames.textCoreContent}`, start: 'top 70%' },
    },
  )
}

onMounted(() => {
  initProject()
})
</script>

<template>
  <div class="mx-auto mt-10 w-300 pb-30">
    <!-- 背景区域 -->
    <div class="relative flex justify-between rounded-[20px] p-9">
      <div
        class="absolute inset-0 rounded-[20px] bg-linear-to-r from-green-100 via-green-100 to-green-100/70"
      />
      <div class="relative z-8 p-8">
        <span class="rounded-[100px] bg-green-500/20 px-4 py-2 text-xl text-black"
          >坚持 21 天学习打卡</span
        >
        <div class="pt-8 text-xl font-bold text-green-500">通过和 AI 对话，提高英语水平</div>
        <div class="pt-5 text-xl font-bold text-gray-700">超 1000000 学员选择，提高英语水平</div>
        <div class="flex items-center gap-2 pt-10">
          <button
            class="block h-10 w-30 cursor-pointer rounded-[100px] bg-green-700 px-4 py-2 text-sm text-white"
          >
            立刻学习
          </button>
          <button
            class="block h-10 w-30 cursor-pointer rounded-[100px] bg-green-700 px-4 py-2 text-sm text-white"
          >
            查看课程
          </button>
        </div>
      </div>
      <div class="relative z-8 p-8">
        <Hologram />
      </div>
    </div>

    <!-- 描述区域 -->
    <div class="rounded-[20px] p-10 text-center">
      <div :class="clsx(classNames.textWhy, 'text-2xl font-bold text-gray-800')">
        为什么选择我们？
      </div>
      <div :class="clsx(classNames.textWhyContent, 'mt-4 text-xl font-bold text-gray-600')">
        通过科学验证，AI 英语学习方式显著优于传统英语学习方式
      </div>
    </div>

    <!-- 数据统计区域 -->
    <div class="mt-16 flex items-center justify-between py-12">
      <template v-for="(item, index) in stats" :key="item.label">
        <div class="flex-1 text-center">
          <div class="flex items-baseline justify-center gap-1">
            <span class="text-4xl font-bold text-gray-800">{{ item.value }}</span>
            <span class="text-2xl font-bold text-green-500">{{ item.suffix }}</span>
          </div>
          <div class="mt-2 text-gray-500">{{ item.label }}</div>
        </div>
        <div v-if="index < stats.length - 1" class="h-16 w-px bg-gray-200" />
      </template>
    </div>
    <div class="relative mb-6 py-8 text-center">
      <div
        class="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-200/30 blur-3xl"
      />
      <div class="relative z-10">
        <span
          :class="
            clsx(
              classNames.textCore,
              'mb-4 inline-block rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-600',
            )
          "
          >核心优势</span
        >
        <div
          :class="
            clsx(
              classNames.textCoreTitle,
              'bg-linear-to-r from-gray-800 via-green-700 to-green-500 bg-clip-text text-3xl font-bold text-transparent',
            )
          "
        >
          重新定义英语学习方式
        </div>
        <div
          :class="
            clsx(classNames.textCoreContent, 'mx-auto mt-4 text-base leading-relaxed text-gray-500')
          "
        >
          结合 AI 技术与语言学研究，打造沉浸式学习体验
        </div>
      </div>
    </div>
    <div
      :class="clsx(classNames.cardsContainer, 'grid grid-cols-3 gap-6')"
      style="perspective: 1000px"
    >
      <div
        v-for="(item, index) in aboutList"
        :key="item.title"
        :class="
          clsx(
            classNames.aboutCard,
            'relative cursor-pointer overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:border-green-300 hover:shadow-xl hover:shadow-green-500/10',
          )
        "
        :style="{ animationDelay: `${index * 100}ms` }"
      >
        <!-- 装饰性背景图案 -->
        <div
          class="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-green-100 blur-2xl transition-all duration-700 group-hover:scale-150 group-hover:bg-green-200"
        />
        <div class="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-green-50" />

        <!-- 图标区域 -->
        <div
          class="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl transition-all duration-300 group-hover:scale-110 group-hover:bg-green-200"
        >
          <ElIcon :size="32">
            <component :is="item.icon" />
          </ElIcon>
        </div>

        <!-- 内容区域 -->
        <div class="relative z-10">
          <div class="mb-3 text-xl font-bold text-gray-800">{{ item.title }}</div>
          <div class="text-sm leading-relaxed text-gray-500">{{ item.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
