import { ref, onMounted } from 'vue'

export function useFocus() {
  const containerRef = ref<HTMLElement>()

  onMounted(() => {
    containerRef.value?.focus()
  })

  return {
    containerRef,
  }
}
