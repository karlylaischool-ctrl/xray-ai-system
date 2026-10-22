import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/doctor-dashboard',
    name: 'DoctorDashboard',
    component: () => import('@/views/DoctorDashboard.vue'),
    meta: { requiresAuth: true, role: 'doctor' }
  },
  {
    path: '/patient-dashboard',
    name: 'PatientDashboard',
    component: () => import('@/views/PatientDashboard.vue'),
    meta: { requiresAuth: true, role: 'patient' }
  },
  {
    path: '/patients',
    name: 'Patients',
    component: () => import('@/views/Patients.vue'),
    meta: { requiresAuth: true, role: 'doctor' }
  },
  {
    path: '/patients/:id',
    name: 'PatientDetail',
    component: () => import('@/views/PatientDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/views/Reports.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports/:id',
    name: 'ReportDetail',
    component: () => import('@/views/ReportDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports/new',
    name: 'NewReport',
    component: () => import('@/views/NewReport.vue'),
    meta: { requiresAuth: true, role: 'doctor' }
  },
  {
    path: '/appointments',
    name: 'Appointments',
    component: () => import('@/views/Appointments.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/chatbot',
    name: 'Chatbot',
    component: () => import('@/views/Chatbot.vue'),
    meta: { requiresAuth: true, role: 'patient' }
  },
  {
    path: '/versions',
    name: 'Versions',
    component: () => import('@/views/Versions.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login'
  } else if (to.meta.role && authStore.user?.role !== to.meta.role) {
    return '/'
  }
})

export default router
