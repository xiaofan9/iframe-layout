import Vue from "vue";
import App from "./App.vue";
import ElementUI from "element-ui";
import router from "@/routes";
import store from "@/store";
import mixins from "@/mixins";
import vueFn from "@/helpers/vue-fn"

import "@/assets/style/global.css";
import "nprogress/nprogress.css";
import "element-ui/lib/theme-chalk/index.css";

import "@/helpers/permission";

Vue.config.productionTip = false;
Vue.use(ElementUI);
Vue.mixin(mixins);
Vue.use(vueFn);

Vue.config.errorHandler = function(err, vm, info) {
  Vue.nextTick(() => {
    if (process.env.NODE_ENV === "development") {
      console.group(">>>>>> 错误信息 >>>>>>");
      console.error(info);
      console.groupEnd();
      console.group(">>>>>> Vue 实例 >>>>>>");
      console.error(vm);
      console.groupEnd();
      console.group(">>>>>> Error >>>>>>");
      console.error(err);
      console.groupEnd();
    }
  });
};

new Vue({
  render: h => h(App),
  router,
  store
}).$mount("#app");
