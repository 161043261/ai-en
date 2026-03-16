<script setup lang="ts">
import { ref, onMounted, useTemplateRef } from 'vue'
import * as THREE from 'three'
import type { AuthType } from '../types'

// GLTF 模型加载器
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// 轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const metaUrl = import.meta.url
const canvasRef = useTemplateRef<HTMLCanvasElement>(metaUrl)

const authType = ref<AuthType>('login')

const emits = defineEmits(['changeAuthType'])

// 场景
const scene = new THREE.Scene()

// 时钟
const timer = new THREE.Timer()

// 当前模型
let currentModel: THREE.Group | null = null

// 动画混合器
let mixer: THREE.AnimationMixer | null = null

const loadModel = (url: AuthType) => {
  // 移除当前模型
  if (currentModel) {
    scene.remove(currentModel)
    currentModel = null
  }

  // 加载新模型
  const loader = new GLTFLoader()
  authType.value = url

  if (url === 'login') {
    loader.load('/models/fu_xuan/scene.gltf', (gltf) => {
      currentModel = gltf.scene
      scene.add(currentModel)
      scene.position.y = -0.8
      currentModel.scale.set(0.8, 0.8, 0.8)
    })
  }

  if (url === 'register') {
    loader.load('/models/ruan_mei/scene.gltf', (gltf) => {
      currentModel = gltf.scene
      scene.add(currentModel)
      scene.position.y = -0.8
      currentModel.scale.set(0.8, 0.8, 0.8)
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(currentModel)
        gltf.animations.forEach((animation) => {
          const action = mixer!.clipAction(animation)
          action.play()
        })
      }
    })
  }

  emits('changeAuthType', url)
}

const initThree = () => {
  // canvas 宽度
  const width = canvasRef.value!.clientWidth
  // canvas 高度
  const height = canvasRef.value!.clientHeight

  // 相机
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)

  // 设置相机位置
  camera.position.set(1, 0.5, 1)

  // 渲染器
  const renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value!, // 渲染容器
    antialias: true, // 抗锯齿
    alpha: true, // 透明背景
    precision: 'highp', // 高精度
    powerPreference: 'high-performance', // 高性能
  })

  loadModel(authType.value)

  // 设置渲染器大小
  renderer.setSize(width, height)
  // 渲染场景
  renderer.render(scene, camera)

  // 轨道控制器
  const controls = new OrbitControls(camera, renderer.domElement)

  const animate = () => {
    requestAnimationFrame(animate)
    mixer?.update(timer.getDelta())
    // 旋转场景
    scene.rotation.y -= 0.01
    // 更新轨道控制器
    controls.update()
    // 渲染场景
    renderer.render(scene, camera)
  }
  animate()
}

onMounted(() => {
  initThree()
})
</script>

<template>
  <div class="relative h-full w-200 bg-linear-to-br from-gray-800 to-gray-900">
    <canvas class="h-full w-full" :ref="metaUrl" />
    <div class="absolute top-6 left-6">
      <div class="flex items-center gap-2">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-[10px] bg-linear-to-br from-green-500 to-lime-600"
        >
          <span class="text-xl font-bold text-white">EN</span>
        </div>
        <span class="text-xl font-bold text-white">English App</span>
      </div>
    </div>
    <div class="absolute top-6 right-6">
      <div class="flex items-center gap-2 rounded-lg bg-white/10 p-1 backdrop-blur-sm">
        <button
          @click="loadModel('login')"
          :class="
            authType === 'login'
              ? 'rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all'
              : 'rounded-md px-4 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white'
          "
        >
          登录
        </button>
        <button
          @click="loadModel('register')"
          :class="
            authType === 'register'
              ? 'rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all'
              : 'rounded-md px-4 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white'
          "
        >
          注册
        </button>
      </div>
    </div>
  </div>
</template>
