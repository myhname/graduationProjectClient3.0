import {
  createRouter,
  createWebHistory
} from 'vue-router'

const routes = [
  {
    name: 'index',
    path: '/',
    component: ()=> import('../views/MyHome.vue')
  },{
    name: 'editor',
    path: '/editor',
    component: () => import('../views/MyContent.vue')
  },{
    name: 'account',
    path: '/account',
    component: () => import('../views/MyUser.vue')
  }
]

const router = createRouter({
  routes,
  history: createWebHistory()
})

export default router