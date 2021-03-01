import request from '@/utils/request'

export function listUser(query) {
  return request({
    url: '/system/manager/list',
    method: 'get',
    params: query
  })
}
export function deleteListUser(ids) {
  return request({
    url:`/system/manager/${ids}`,
    method: 'delete'
  })
}
// 修改项目状态
export function updateProfileStatus(id,projectStatus) {
  const data = {
    id,
    projectStatus
  }
  return request({
    url: '/system/manager/editProject',
    method: 'put',
    data:data
  })
}
// 添加项目
export function addProject(data) {
  return request({
    url: '/system/manager/addProject',
    method: 'post',
    data: data
  })
}
// 修改项目
export function updateProject(data) {
  return request({
    url: '/system/manager/editProject',
    method: 'put',
    data: data
  })
}
// 查询项目信息
export function getUserProfile(id) {
  return request({
    url: '/system/manager/'+id,
    method: 'get'
  })
}
// 导出项目
export function exportProject(query) {
  return request({
    url: '/system/manager/export',
    method: 'get',
    params: query
  })
}
// 下载用户导入模板
export function importTemplate() {
  return request({
    url: '/system/manager/importTemplate',
    method: 'get'
  })
}
// 导入项目

