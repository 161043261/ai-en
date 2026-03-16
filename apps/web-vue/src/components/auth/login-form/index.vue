<script setup lang="ts">
import { ref, useTemplateRef, toRaw } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { login } from '@/api/user'
import type { UserLogin } from '@ai-en/common/types/user'
import md5 from 'md5'
import {
  type FormInstance,
  ElFormItem,
  ElInput,
  ElButton,
  ElForm,
  type FormItemRule,
} from 'element-plus'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useLogin } from '@/hooks/use-login'

const { hide } = useLogin()
const metaUrl = import.meta.url
const formRef = useTemplateRef<FormInstance>(metaUrl)
const userStore = useUserStore()
const form = ref<UserLogin>({
  phone: '',
  password: '',
})

const rules: Record<keyof UserLogin, FormItemRule[]> = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleLogin = async () => {
  await formRef.value?.validate()
  const res = await login({
    ...toRaw(form.value),
    password: md5(form.value.password),
  })
  if (res.code === 200) {
    userStore.setUser = res.data
    ElMessage.success('登录成功')
    hide()
  } else {
    ElMessage.error(res.message)
  }
}
</script>

<template>
  <div class="mb-8">
    <h1 class="mb-2 text-3xl font-bold text-gray-800">欢迎登录</h1>
    <p class="text-sm text-gray-500">请填写以下信息以完成登录</p>
  </div>

  <ElForm
    :ref="metaUrl"
    :model="form"
    :rules="rules"
    label-width="80"
    label-position="top"
    class="space-y-6"
  >
    <ElFormItem prop="phone">
      <ElInput
        :maxlength="11"
        v-model="form.phone"
        placeholder="请输入手机号"
        size="large"
        class="h-12"
        :prefix-icon="User"
      />
    </ElFormItem>

    <ElFormItem prop="password">
      <ElInput
        v-model="form.password"
        type="password"
        placeholder="请输入密码"
        size="large"
        class="h-12"
        :prefix-icon="Lock"
        show-password
      />
    </ElFormItem>

    <ElFormItem class="pt-4">
      <ElButton
        type="primary"
        size="large"
        class="h-12 w-full border-0 bg-linear-to-r from-green-500 to-lime-600 text-base font-semibold hover:from-green-600 hover:to-lime-700"
        @click="handleLogin"
      >
        登录
      </ElButton>
    </ElFormItem>
  </ElForm>
</template>
