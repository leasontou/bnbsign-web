import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/contracts',
    name: 'contracts',
    component: () => import('../views/UserContracts')
  },
  {
    path: '/sign',
    name: 'sign',
    component: () => import('../views/Sign')
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
