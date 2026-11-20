
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/students'
  },
  {
    path: '/students',
    component: () => import('../views/StudentsView.vue')
  },
  {
    path: '/courses',
    component: () => import('../views/CoursesView.vue')
  },
  {
    path: '/enrollments',
    component: () => import('../views/EnrollmentsView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
