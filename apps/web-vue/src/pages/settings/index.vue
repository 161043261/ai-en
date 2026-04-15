<script setup lang="ts">
import { ref, onMounted, useTemplateRef } from 'vue'
import type { UserUpdate } from '@ai-en/common/types/user'
import {
  type FormRules,
  type UploadFile,
  type FormInstance,
  ElForm,
  ElFormItem,
  ElRow,
  ElCol,
  ElTag,
  ElCard,
  ElButton,
  ElInput,
  ElSwitch,
  ElUpload,
  ElMessage,
  ElMessageBox,
  ElTimePicker,
} from 'element-plus'
import defaultAvatar from '@/assets/images/avatar.svg'
import { useUserStore } from '@/stores/user'
import { uploadAvatarApi, updateUserApi } from '@/api/user'
import useAvatar from '@/hooks/use-avatar'
import useLogin from '@/hooks/use-login'
import { storeToRefs } from 'pinia'
import { z } from 'zod'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { customAvatar } = useAvatar()
const { logout } = useLogin()
const formRef = useTemplateRef<FormInstance>('formRef') //表单ref
const userStore = useUserStore()

const { user } = storeToRefs(userStore)
const { updateUser } = userStore

const previewUrl = ref<string>('')
const form = ref<UserUpdate>({
  name: '', // 用户名
  email: '', // 邮箱
  phone: '', // 手机号
  isTimingTask: false, // 是否开启定时任务
  timingTaskTime: '', // 定时任务时间，默认晚上 0 点开始，每隔 24 小时执行一次
  address: '', // 地址
  bio: '', // 签名
  avatar: '', // 头像
})

// 上传头像
const handleSelectAvatar = async (file: UploadFile) => {
  if (!file.raw) {
    ElMessage.error(t('settings.messages.selectFile'))
    return
  }
  const formData = new FormData()
  formData.append('file', file.raw)
  const {
    data: { ok, message, data },
  } = await uploadAvatarApi(formData)
  if (ok) {
    form.value.avatar = data.databaseUrl
    previewUrl.value = data.previewUrl
  } else {
    ElMessage.error(message)
  }
}

const rules: FormRules = {
  name: [{ required: true, message: t('settings.personal.usernamePlaceholder'), trigger: 'blur' }],
  email: [
    { required: false, message: t('settings.personal.emailPlaceholder'), trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (!value) return callback()
        const result = z.email(t('settings.messages.emailFormatError')).safeParse(value)
        if (!result.success) {
          callback(
            new Error(result.error.issues[0]?.message ?? t('settings.messages.emailFormatError')),
          )
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  isTimingTask: [
    {
      required: true,
      message: t('settings.personal.timingTask'),
      trigger: 'blur',
      type: 'boolean',
    },
  ],
  timingTaskTime: [
    { required: true, message: t('settings.personal.timingTaskTimePlaceholder'), trigger: 'blur' },
  ],
}

const handleSave = async () => {
  await formRef.value?.validate()
  const { data: res } = await updateUserApi(form.value)
  if (res.ok && res.data) {
    updateUser(res.data)
    ElMessage.success(t('settings.messages.updateSuccess'))
  } else {
    ElMessage.error(res.message)
  }
}

const handleLogout = () => {
  ElMessageBox.confirm(
    t('settings.messages.logoutConfirmText'),
    t('settings.messages.logoutConfirmTitle'),
    {
      confirmButtonText: t('settings.danger.logoutBtn'),
      cancelButtonText: 'Cancel',
      type: 'warning',
    },
  ).then(logout)
}

const init = () => {
  if (user.value) {
    form.value = { ...user.value }
    previewUrl.value = customAvatar(form.value.avatar!)
  }
}

onMounted(init)
</script>

<template>
  <div class="mx-auto w-300 px-4 py-6">
    <div class="flex items-center justify-between">
      <div>
        <div class="text-xl font-extrabold text-slate-900">{{ t('settings.title') }}</div>
        <div class="mt-1 text-sm text-slate-500">{{ t('settings.subtitle') }}</div>
      </div>

      <div class="flex gap-2">
        <ElButton @click="init">{{ t('settings.reset') }}</ElButton>
        <ElButton @click="handleSave" type="primary">{{ t('settings.save') }}</ElButton>
      </div>
    </div>

    <ElRow :gutter="16" class="mt-4">
      <ElCol :span="8">
        <ElCard shadow="never">
          <template #header>
            <div class="font-bold">{{ t('settings.avatar.title') }}</div>
          </template>

          <div class="flex items-center gap-4">
            <img
              class="h-20 w-20 rounded-full border-2 border-gray-200 object-cover"
              :src="previewUrl || defaultAvatar"
              loading="lazy"
              referrerpolicy="no-referrer"
            />

            <div class="flex flex-col gap-2">
              <ElUpload
                :show-file-list="false"
                :auto-upload="false"
                accept="image/*"
                :on-change="handleSelectAvatar"
              >
                <ElButton type="primary">{{ t('settings.avatar.select') }}</ElButton>
              </ElUpload>

              <div class="text-xs text-slate-500">{{ t('settings.avatar.tips') }}</div>
            </div>
          </div>
        </ElCard>

        <ElCard shadow="never" class="mt-4">
          <template #header>
            <div class="font-bold">{{ t('settings.account.title') }}</div>
          </template>

          <div class="text-sm text-slate-600">
            <div class="flex items-center justify-between">
              <span>{{ t('settings.account.status') }}</span>
              <ElTag type="success"> {{ t('settings.account.loggedIn') }} </ElTag>
            </div>
          </div>
        </ElCard>
      </ElCol>

      <ElCol :span="16">
        <ElCard shadow="never">
          <template #header>
            <div class="font-bold">{{ t('settings.personal.title') }}</div>
          </template>

          <ElForm label-width="140px" :model="form" :rules="rules" ref="formRef" status-icon>
            <ElFormItem :label="t('settings.personal.username')" prop="name">
              <ElInput
                v-model="form.name"
                :placeholder="t('settings.personal.usernamePlaceholder')"
                clearable
              />
            </ElFormItem>

            <ElFormItem :label="t('settings.personal.email')" prop="email">
              <ElInput
                v-model="form.email"
                :placeholder="t('settings.personal.emailPlaceholder')"
                clearable
              />
            </ElFormItem>

            <ElFormItem :label="t('settings.personal.timingTask')" prop="isTimingTask">
              <ElSwitch v-model="form.isTimingTask" />
            </ElFormItem>
            <ElFormItem :label="t('settings.personal.timingTaskTime')" prop="timingTaskTime">
              <div>
                <ElTimePicker
                  format="HH:mm:ss"
                  value-format="HH:mm:ss"
                  v-model="form.timingTaskTime"
                  :placeholder="t('settings.personal.timingTaskTimePlaceholder')"
                />
                <div class="mt-3 text-xs text-slate-500">
                  {{ t('settings.personal.timingTaskTips') }}
                </div>
              </div>
            </ElFormItem>

            <ElFormItem :label="t('settings.personal.address')" prop="address">
              <ElInput
                v-model="form.address"
                :placeholder="t('settings.personal.addressPlaceholder')"
                clearable
              />
            </ElFormItem>

            <ElFormItem :label="t('settings.personal.bio')" prop="bio">
              <ElInput
                v-model="form.bio"
                :placeholder="t('settings.personal.bioPlaceholder')"
                type="textarea"
                :rows="4"
                maxlength="120"
                show-word-limit
              />
            </ElFormItem>
          </ElForm>
        </ElCard>

        <ElCard shadow="never" class="mt-4">
          <template #header>
            <div class="font-bold">{{ t('settings.danger.title') }}</div>
          </template>

          <div class="flex items-center justify-between">
            <div>
              <div class="font-bold text-slate-900">{{ t('settings.danger.logout') }}</div>
              <div class="text-sm text-slate-500">{{ t('settings.danger.logoutDesc') }}</div>
            </div>
            <ElButton @click="handleLogout" type="danger" plain>
              {{ t('settings.danger.logoutBtn') }}
            </ElButton>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>
