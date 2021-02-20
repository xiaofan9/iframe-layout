import store from "@/store";
import { getToken } from "@/util/auth";
import { Message } from "element-ui";

export const request = [
  config => {
    const isToken = (config.data || {}).isToken === false;
    const token = getToken();

    if (token && !isToken && token !== "null" && token !== "undefined") {
      config.headers["Authorization"] = "Bearer " + token; // 让每个请求携带token--['Authorization']为自定义key 请根据实际情况自行修改
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
];

export const response = [
  res => {
    const status = Number(res.status) || 200;

    //如果是401则跳转到登录页面
    if (status === 401) {
      store.dispatch("logout");

      console.log("用户掉线！");

      return Promise.reject("用户掉线！");
    }

    if (status !== 200) {
      const msg = res.msg || res.data.msg || "服务器出错了！";

      Message.error({
        message: msg
      });

      return Promise.reject("请求出错！");
    }

    return res;
  },
  error => {
    return Promise.reject(new Error(error));
  }
];
