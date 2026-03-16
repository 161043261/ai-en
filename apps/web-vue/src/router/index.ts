import { createRouter, createWebHistory } from 'vue-router'
import home from './home'
import wordBook from './word-book'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...home, ...wordBook],
})

export default router
