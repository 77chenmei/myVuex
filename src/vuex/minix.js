/**
 * @desc vuex 初始化
 */
function vuexInit() {
  // console.log('xx'); 答应次数 是国有组件数 + new vue()
  const options = this.$options;  // 当前vue 实例的 options；
  // 判断是否 是根实例
  if (options.store) {
    this.$store = options.store;
  } else {
    // 判断是否 存在父组件 this.$parent or options.parent
    if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store;
    }
  }
}

/**
 * @desc 添加混入
 * @param {Vue} Vue 
 */
export default function applyMixin (Vue) {
  Vue.mixin({
    beforeCreate: vuexInit,
  })
}