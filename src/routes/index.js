import VueRouter from "vue-router";
import Vue from "vue";

Vue.use(VueRouter);

export default new VueRouter({
  routes: [
    {
      path: "/404",
      component: () => import("@/views/404")
    },
    {
      path: "*",
      component: () => import("@/views/Layout")
    }
  ]
});
