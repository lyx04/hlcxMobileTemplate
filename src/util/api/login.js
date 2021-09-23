import request from "@/util/service/httpClient";
const url = `${process.env.VUE_APP_BASE_URL}`;
const service = `${url}/iemc-auth`;
const orgservice = `${url}/iemc-system`;
// 登录方法
export function CHECKTOKEN(data) {
  return request({
    url: `${service}/oauth/check_token`,
    method: "post",
    data: data
  });
}
//通过refreshtoken重新获取token
export function REFRESHTOKEN(data) {
  data += "&grant_type=refresh_token";
  return request({
    url: `${service}/oauth/token`,
    method: "post",
    data: data
  });
}
// 退出方法
export function logout() {
  return request({
    url: `${service}/sys/logout`,
    method: "post"
  });
}
//获取组织机构相信信息
export function GET_ORG(orgId) {
  return request({
    url: `${orgservice}/system/org/${orgId}?internet=no`,
    method: "get"
  });
}
//通过orgid判断是不是顶级组织机构
export function IS_TOP(orgId) {
  return request({
    url: `${orgservice}/system/org/isTop/${orgId}`,
    method: "get"
  });
}
/**
 delete
 url: '/system/role/' + roleId,
  method: 'delete'

 get
 params: query
 **/
