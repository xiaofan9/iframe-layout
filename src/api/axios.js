import axios from "axios";
import { request, response } from "./interceptors";

axios.defaults.timeout = 10000;

// 返回其他状态吗
axios.defaults.validateStatus = function(status) {
  return status >= 200 && status <= 500; // 默认的
};
// 跨域请求，允许保存cookie
axios.defaults.withCredentials = true;

//HTTPrequest拦截
axios.interceptors.request.use(...request);

// HTTPresponse拦截
axios.interceptors.response.use(...response);

export default axios;
