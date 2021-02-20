import NProgress from "nprogress"; // progress bar
import router from "@/routes";
import store from "@/store";

export default async function permission(to, from, next) {
  NProgress.start();

  if (store.state.env === "test") {
    // 设置token
  }

  next();

  NProgress.done();
}

router.beforeEach(permission);
