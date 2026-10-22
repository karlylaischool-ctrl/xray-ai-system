import { defineStore } from 'pinia'
import axios from 'axios'
import { API_URL } from '../apiConfig'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    async login(email, password) {
      try {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password })
        this.token = response.data.token
        this.user = response.data.user
        localStorage.setItem('token', this.token)
        return { success: true }
      } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Login failed' }
      }
    },

    async register(userData) {
      try {
        const response = await axios.post(`${API_URL}/auth/register`, userData)
        this.token = response.data.token
        this.user = response.data.user
        localStorage.setItem('token', this.token)
        return { success: true }
      } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Registration failed' }
      }
    },

    async fetchUser() {
      if (!this.token) return
      
      try {
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        this.user = response.data.user
      } catch (error) {
        this.logout()
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
    }
  }
})
