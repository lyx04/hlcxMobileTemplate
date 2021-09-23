import Vue from "vue";
import axios from "axios";
import { Toast, Indicator } from "mint-ui";
import _ from "lodash";

let needLoadingRequestCount = 0; //当前正在请求的数量
import errorCode from "./errorCode";
function showLoading() {
  let main = document.querySelector("#app");
  if (main) {
    if (needLoadingRequestCount === 0) {
      Indicator.open({
        text: "加载中...",
        spinnerType: "fading-circle"
      });
    }
    needLoadingRequestCount++;
  }
}
function closeLoading() {
  Vue.nextTick(() => {
    // 以服务的方式调用的 Loading 需要异步关闭
    needLoadingRequestCount--;
    needLoadingRequestCount = Math.max(needLoadingRequestCount, 0); // 保证大于等于0
    if (needLoadingRequestCount === 0) {
      hideLoading();
    }
  });
}
var hideLoading = _.debounce(() => {
  Indicator.close();
}, 300);
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: process.env.VUE_APP_BASE_API,
  // 超时
  timeout: 15000
});
// request拦截器
var token;
if (sessionStorage.getItem("access_token")) {
  token = "Bearer " + JSON.parse(sessionStorage.getItem("access_token"));
} else {
  token = null;
}
axios.defaults.headers["Content-Type"] = token
  ? "application/json;charset=utf-8"
  : "application/x-www-form-urlencoded";
service.interceptors.request.use(
  config => {
    if (sessionStorage.getItem("access_token")) {
      token = "Bearer " + JSON.parse(sessionStorage.getItem("access_token"));
    } else {
      token = null;
    }
    config.headers["Authorization"] = token
      ? token
      : "Basic bW9iaWxlOjEyMzQ1Ng==";
    config.loading == false ? "" : showLoading();
    return config;
  },
  error => {
    closeLoading();
    Promise.reject(error);
  }
);
// 响应拦截器
service.interceptors.response.use(
  res => {
    closeLoading();
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200;
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || errorCode["default"];
    if (code === 5000) {
      Toast({
        message: msg,
        duration: 2 * 1000
      });
      window.appvue.$router.push({ path: "/mobile/error" });
    } else if (code === 1002 || code === 1003 || code === 4005) {
      Toast({
        message: msg,
        duration: 2 * 1000
      });
      //这里直接报错有可能影响程序停止
      return Promise.reject(new Error(msg));
    } else if (code !== 200) {
      Toast({
        message: msg,
        duration: 2 * 1000
      });
      //这里直接报错有可能影响程序停止
      return Promise.reject(new Error(msg));
    } else {
      return res.data;
    }
  },
  error => {
    closeLoading();
    let { message } = error;
    if (error.response && error.response.status == "401") {
      message = "暂无权限，请重新登录！";
      var setupWebViewJavascriptBridge = function(callback) {
        if (window.WebViewJavascriptBridge) {
          return callback(window.WebViewJavascriptBridge);
        } else {
          document.addEventListener(
            "WebViewJavascriptBridgeReady",
            function() {
              callback(window.WebViewJavascriptBridge);
            },
            false
          );
        }
        if (window.WVJBCallbacks) {
          return window.WVJBCallbacks.push(callback);
        }
        window.WVJBCallbacks = [callback];
        var WVJBIframe = document.createElement("iframe");
        WVJBIframe.style.display = "none";
        WVJBIframe.src = "https://__bridge_loaded__";
        document.documentElement.appendChild(WVJBIframe);
        setTimeout(function() {
          document.documentElement.removeChild(WVJBIframe);
        }, 0);
      };
      // 处理交互  方法名要和ios内定义的对应
      setupWebViewJavascriptBridge(function(bridge) {
        // 前端调用app
        bridge.callHandler("close", "", response => {
          alert("收到oc过来的回调:" + response);
        });
      });
    } else if (error.response && error.response.status == "500") {
      message =
        error.response.data.message ||
        error.response.data.msg ||
        error.response.data.error_description;
    } else if (error.response && error.response.status == "403") {
      message =
        error.response.data.message ||
        error.response.data.msg ||
        error.response.data.error_description;
    } else if (message == "Network Error") {
      message = "后端接口连接异常";
    } else if (message.includes("timeout")) {
      message = "系统接口请求超时";
    } else if (message.includes("Request failed with status code")) {
      message = "系统接口" + message.substr(message.length - 3) + "异常";
    }
    Toast({
      message: message || "系统错误，请联系管理员",
      duration: 2 * 1000
    });
    return Promise.reject(error);
  }
);

export default service;
