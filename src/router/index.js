import Vue from "vue";
import VueRouter from "vue-router";
import error from "../views/errror.vue";
import { Toast } from "mint-ui";

Vue.use(VueRouter);

const routes = [
  {
    path: "/error",
    name: "error",
    component: error
  },
];

const router = new VueRouter({
  mode: "history",
  base: "{{name}}",
  routes
});

router.beforeEach((to, from, next) => {
  window.scrollTo(0, 0); // 跳转后返回顶部
  if (to.matched.some(record => record.meta.requireAuth)) {
    // 判断该路由是否需要登录权限
    if (sessionStorage.getItem("access_token")) {
      next();
    } else {
      Toast({
        message: "获取用户信息失败~",
        duration: 2 * 1000
      });
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
    }
  } else {
    next();
  }
});
router.afterEach(route => {
  // 从路由的元信息中获取 title 属性
  if (route.meta.title) {
    document.title = route.meta.title;
    // 如果是 iOS 设备，则使用如下 hack 的写法实现页面标题的更新
    if (navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
      const hackIframe = document.createElement("iframe");
      hackIframe.style.display = "none";
      hackIframe.src = "/static/html/fixIosTitle.html?r=" + Math.random();
      document.body.appendChild(hackIframe);
      setTimeout(() => {
        document.body.removeChild(hackIframe);
      }, 300);
    }
  }
});
export default router;
