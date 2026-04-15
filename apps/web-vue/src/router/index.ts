import { createRouter, createWebHistory } from 'vue-router'
import home from './home'
import wordBook from './word-book'
import settings from './settings'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...home, ...wordBook, ...settings],
})

export default router
