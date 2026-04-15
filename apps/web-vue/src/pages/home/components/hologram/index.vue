<script lang="ts" setup>
import { onMounted, useTemplateRef } from 'vue'
import * as THREE from 'three'

// GLTF 模型加载器
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// 轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const canvasRef = useTemplateRef<HTMLCanvasElement>('canvas')

const initThree = () => {
  // 场景
  const scene = new THREE.Scene()

  // // 环境光
  // const ambientLight = new THREE.AmbientLight(0xffffff, 1)
  // scene.add(ambientLight)
  // // 平行光
  // const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  // directionalLight.position.set(5, 10, 7.5)
  // scene.add(directionalLight)

  // 动画混合器
  let animationMixer: THREE.AnimationMixer | null = null
  const timer = new THREE.Timer()

  // 相机
  const camera = new THREE.PerspectiveCamera(
    75, // fov: The vertical field of view. 相机观察物体的角度
    500 / 250, // aspect — The aspect ratio. 相机的宽高比
    0.1, // near — The camera's near plane. 相机最近观察距离
    1000, // far — The camera's far plane. 相机最远观察距离
  )

  // 设置相机位置
  camera.position.set(0, 0, 15)

  // GLTF 模型加载器
  const loader = new GLTFLoader()

  // 加载模型
  loader.load('/models/gan_yu/scene.gltf', (gltf) => {
    // 模型加载完成后，将模型添加到场景中
    scene.add(gltf.scene)

    // 缩放模型
    gltf.scene.scale.set(1, 1, 1)
    // 调整位置
    gltf.scene.position.y = -10

    if (gltf.animations.length > 0) {
      animationMixer = new THREE.AnimationMixer(gltf.scene)
      gltf.animations.forEach((clip) => {
        const action = animationMixer!.clipAction(clip)
        action.play()
      })
    }
  })

  // 渲染器
  const renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value!, // 渲染容器
    antialias: true, // 抗锯齿
    alpha: true, // 透明背景
    precision: 'highp', // 高精度
    powerPreference: 'high-performance', // 高性能
  })

  // 设置渲染器大小
  renderer.setSize(500, 250)
  renderer.render(scene, camera)

  // 轨道控制器
  const controls = new OrbitControls(camera, renderer.domElement)

  const animate = () => {
    requestAnimationFrame(animate)
    const delta = timer.getDelta()
    animationMixer?.update(delta)
    // 旋转场景
    scene.rotation.y -= 0.01
    // 更新轨道控制器
    controls.update()
    // 渲染场景
    renderer.render(scene, camera)
  }

  animate()
}

onMounted(initThree)
</script>

<template>
  <canvas ref="canvas" />
</template>
