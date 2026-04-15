import { ref, onMounted } from 'vue'

function useFocus() {
  const containerRef = ref<HTMLElement>()

  onMounted(() => {
    containerRef.value?.focus()
  })

  return {
    containerRef,
  }
}

export default useFocus
