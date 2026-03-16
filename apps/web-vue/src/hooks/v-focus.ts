import { type Directive } from 'vue'

// 自定义指令中
// 使用 Vue 指令的生命周期钩子
// 而不是 Vue 组件的生命周期钩子

// const vFocus: Directive<HTMLElement> = (el /** , binding */) => {
//   onMounted(() => {
//     console.log(el)
//     el.focus()
//   })
// }

// export default vFocus

const vFocus: Directive<HTMLElement> = {
  mounted(el) {
    el.focus()
  },
}

export default vFocus
