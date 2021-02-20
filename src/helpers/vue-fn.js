export default {
  install(Vue) {
    window.elMessage = Vue.prototype.$message;
  }
}