//基础路由
const baseRoute = [
  {
    path: '',
    redirect:'/sls'
  },
  {
    path: '/sls',
    meta: { title: '神啊神' },
    component:()=>import('../views/ShenleShen/ShenLeShen.vue'),
  },
  {
    path: '/404',
    meta: { title: '薛定谔的页面' },
    component: () => import('@/components/error/404.vue')
  },
  {
    path: '/:catchAll(.*)',
    // path:'/*',
    redirect:'/404',
    // meta: { title: '薛定谔的页面' },
    // component: () => import('@/components/error/404.vue')
  }
]

export default baseRoute
