// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue')
      },
      {
        path: 'search-result',
        name: 'Search Result',
        component: () => import('@/views/SearchResult.vue')
      },
      {
        path: 'detail-view',
        name: 'Detail View',
        component: () => import('@/views/DetailView.vue')
      },
      {
        path: 'about-us',
        name: 'About Us',
        component: () => import('@/views/AboutUs.vue')
      }
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
