import type { InjectionKey, Ref } from 'vue'

export const IS_SHOW_AUTH: InjectionKey<Ref<boolean>> = Symbol('IS_SHOW_AUTH')

export type AuthType = 'login' | 'register'
