<script setup lang="ts">
import { ElFormItem, ElButton, ElForm, ElInput } from 'element-plus'
import { ref, useTemplateRef, toRaw } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { register } from '@/api/user'
import type { UserRegister } from '@ai-en/common/types/user'
import md5 from 'md5'
import type { FormInstance, FormItemRule } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useLogin } from '@/hooks/use-login'

const { hide } = useLogin()

const metaUrl = import.meta.url
const formRef = useTemplateRef<FormInstance>(metaUrl)
const userStore = useUserStore()
const form = ref<UserRegister>({
  name: '',
  phone: '',
  email: '',
  password: '',
})

const rules: Partial<Record<keyof UserRegister, FormItemRule[]>> = {
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 10, message: '用户名长度为 4 到 10', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 10, message: '密码长度为 4 到 10', trigger: 'blur' },
  ],
}

const handleRegister = async () => {
  await formRef.value?.validate()
  const res = await register({
    ...toRaw(form.value),
    password: md5(form.value.password),
  })
  if (res.code === 200) {
    userStore.setUser = res.data
    ElMessage.success('注册成功')
    hide()
  } else {
    ElMessage.error(res.message)
  }
}
</script>

<template>
  <div class="mb-8">
    <h1 class="mb-2 text-3xl font-bold text-gray-800">欢迎注册</h1>
    <p class="text-sm text-gray-500">请填写以下信息以完成注册</p>
  </div>

  <ElForm
    :ref="metaUrl"
    :model="form"
    :rules="rules"
    label-width="80"
    label-position="top"
    class="space-y-6"
  >
    <ElFormItem prop="name">
      <ElInput
        v-model="form.name"
        placeholder="请输入用户名"
        size="large"
        class="h-12"
        :prefix-icon="User"
      />
    </ElFormItem>

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

    <ElFormItem prop="email">
      <ElInput
        v-model="form.email"
        placeholder="请输入邮箱（可选）"
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
        @click="handleRegister"
      >
        注册
      </ElButton>
    </ElFormItem>
  </ElForm>
</template>
