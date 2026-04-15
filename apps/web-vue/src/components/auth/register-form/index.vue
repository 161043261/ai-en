<script setup lang="ts">
import { ElFormItem, ElButton, ElForm, ElInput } from 'element-plus'
import { ref, useTemplateRef, toRaw, computed } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { registerApi } from '@/api/user'
import type { UserRegister } from '@ai-en/common/types/user'
import md5 from 'md5'
import type { FormInstance, FormItemRule } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import useLogin from '@/hooks/use-login'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { hide } = useLogin()

const formRef = useTemplateRef<FormInstance>('form')
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const form = ref<UserRegister>({
  name: '',
  phone: '',
  email: '',
  password: '',
})

const rules = computed<Partial<Record<keyof UserRegister, FormItemRule[]>>>(() => ({
  name: [
    { required: true, message: t('auth.rules.usernameRequired'), trigger: 'blur' },
    { min: 4, max: 10, message: t('auth.rules.usernameLength'), trigger: 'blur' },
  ],
  phone: [
    { required: true, message: t('auth.rules.phoneRequired'), trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: t('auth.rules.phoneInvalid'), trigger: 'blur' },
  ],
  password: [
    { required: true, message: t('auth.rules.passwordRequired'), trigger: 'blur' },
    { min: 6, max: 10, message: t('auth.rules.passwordLength'), trigger: 'blur' },
  ],
}))

const handleRegister = async () => {
  await formRef.value?.validate()
  const { data: res } = await registerApi({
    ...toRaw(form.value),
    password: md5(form.value.password),
  })
  if (res.code === 200) {
    user.value = res.data
    ElMessage.success(t('auth.register.success'))
    hide()
  } else {
    ElMessage.error(res.message)
  }
}
</script>

<template>
  <div class="mb-8">
    <h1 class="mb-2 text-3xl font-bold text-gray-800">{{ t('auth.register.title') }}</h1>
    <p class="text-sm text-gray-500">{{ t('auth.register.subtitle') }}</p>
  </div>

  <ElForm
    ref="form"
    :model="form"
    :rules="rules"
    label-width="80"
    label-position="top"
    class="space-y-6"
  >
    <ElFormItem prop="name">
      <ElInput
        v-model="form.name"
        :placeholder="t('auth.register.username')"
        size="large"
        class="h-12"
        :prefix-icon="User"
      />
    </ElFormItem>

    <ElFormItem prop="phone">
      <ElInput
        :maxlength="11"
        v-model="form.phone"
        :placeholder="t('auth.register.phone')"
        size="large"
        class="h-12"
        :prefix-icon="User"
      />
    </ElFormItem>

    <ElFormItem prop="email">
      <ElInput
        v-model="form.email"
        :placeholder="t('auth.register.email')"
        size="large"
        class="h-12"
        :prefix-icon="User"
      />
    </ElFormItem>

    <ElFormItem prop="password">
      <ElInput
        v-model="form.password"
        type="password"
        :placeholder="t('auth.register.password')"
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
        {{ t('auth.register.submit') }}
      </ElButton>
    </ElFormItem>
  </ElForm>
</template>
