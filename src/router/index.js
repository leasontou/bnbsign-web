import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home')
  },
  {
    path: '/contracts',
    name: 'contracts',
    component: () => import('../views/UserContracts')
  },
  {
    path: '/sign',
    name: 'sign',
    component: () => import('../views/SignContract')
  },
  {
    path: '/neterror',
    name: 'neterror',
    component: () => import('../views/NetworkError')
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
