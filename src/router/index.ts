import { createRouter, createWebHistory } from 'vue-router'
import baseRoute from './baseRoute'
//路由实例
let router = createRouter({
  history: createWebHistory(''),
  routes: baseRoute
})
// //全局路由守卫
// router.beforeEach( (to, from, next) => {

// })
export default router
