import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Mint from "mint-ui";
import "mint-ui/lib/style.css";
import { CHECKTOKEN, REFRESHTOKEN, GET_ORG, IS_TOP } from "@/util/api/login";
import { iconfontUrl, iconfontVersion } from "@/common/config/env";
import { loadStyle } from "@/common/util/util";
import jstool from "hlcx-jstool";
import "@/common/assets/css/all.scss";

Vue.use(Mint);
Vue.prototype.jstool = jstool;
Vue.config.productionTip = false;
//location.search.split("=")[1] token号
// 利用传过来的token先获取用户信息与字典表
//加入token有问题直接修改导航到无权限页面在加载vue,就会直接跳转到无权限页面
/**
 * 通过token登录，有用户信息进行权限认证，有权限初始化vue，没权限直接到无权限页面
 *                无用户信息直接到无登录用户页面，之后在初始化vue
 */
// history.replaceState(null,null,"/mobile/about")
iconfontVersion.forEach(ele => {
  loadStyle(iconfontUrl.replace("$key", ele));
});
new Promise(resolve => {
  sessionStorage.clear();
  if (location.search) {
    CHECKTOKEN("token=" + jstool.jshandle.getParameter("token"))
      .then(e => {
        sessionStorage.setItem(
          "access_token",
          JSON.stringify(jstool.jshandle.getParameter("token"))
        );
        IS_TOP(e.userInfo.orgId).then(isTopres => {
          e.userInfo["isTop"] = isTopres.data;
          sessionStorage.setItem("userInfo", JSON.stringify(e.userInfo));
          sessionStorage.setItem(
            "permissions",
            JSON.stringify(e.userInfo.permissions)
          );
          resolve();
        });
      })
      .catch(() => {
        if (jstool.jshandle.getParameter("refresh_token")) {
          REFRESHTOKEN(
            "refresh_token=" + jstool.jshandle.getParameter("refresh_token")
          )
            .then(e => {
              sessionStorage.setItem(
                "access_token",
                JSON.stringify(e.access_token)
              );
              sessionStorage.setItem("userInfo", JSON.stringify(e.userInfo));
              sessionStorage.setItem(
                "permissions",
                JSON.stringify(e.userInfo.permissions)
              );
              resolve();
            })
            .catch(() => {
              // history.replaceState(null, null, "/mobile/error");
            });
        } else {
          // history.replaceState(null, null, "/mobile/error");
        }
      });
  } else {
    // history.replaceState(null, null, "/mobile/error");
    resolve();
  }
})
  .then(() => {
   
  })
  .finally(() => {
    new Vue({
      router,
      store,
      render: h => h(App)
    }).$mount("#app");
  });
