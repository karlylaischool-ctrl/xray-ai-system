import { defineStore } from 'pinia'
import axios from 'axios'
import { API_URL } from '../apiConfig'

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const useApiStore = defineStore('api', {
  actions: {
    async getPatients(params = {}) {
      const response = await axios.get(`${API_URL}/patients`, { params })
      return response.data
    },

    async createPatient(data) {
      const response = await axios.post(`${API_URL}/patients`, data)
      return response.data
    },

    async updatePatient(id, data) {
      const response = await axios.put(`${API_URL}/patients/${id}`, data)
      return response.data
    },

    async deletePatient(id) {
      const response = await axios.delete(`${API_URL}/patients/${id}`)
      return response.data
    },

    async getReports(params = {}) {
      const response = await axios.get(`${API_URL}/reports`, { params })
      return response.data
    },

    async createReport(data) {
      const response = await axios.post(`${API_URL}/reports`, data)
      return response.data
    },

    async updateReport(id, data) {
      const response = await axios.put(`${API_URL}/reports/${id}`, data)
      return response.data
    },

    async approveReport(id) {
      const response = await axios.put(`${API_URL}/reports/${id}/approve`)
      return response.data
    },

    async deleteReport(id) {
      const response = await axios.delete(`${API_URL}/reports/${id}`)
      return response.data
    },

    async analyzeXRay(data) {
      // Check if data is FormData (file upload) or plain object (path-based)
      if (data instanceof FormData) {
        const response = await axios.post(`${API_URL}/reports/analyze`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        return response.data
      } else {
        // Plain object with imagePath
        const response = await axios.post(`${API_URL}/reports/analyze`, data)
        return response.data
      }
    },

    async getAppointments(params = {}) {
      const response = await axios.get(`${API_URL}/appointments`, { params })
      return response.data
    },

    async createAppointment(data) {
      const response = await axios.post(`${API_URL}/appointments`, data)
      return response.data
    },

    async updateAppointment(id, data) {
      const response = await axios.put(`${API_URL}/appointments/${id}`, data)
      return response.data
    },

    async deleteAppointment(id) {
      const response = await axios.delete(`${API_URL}/appointments/${id}`)
      return response.data
    },

    async askChatbot(data) {
      const response = await axios.post(`${API_URL}/chatbot/ask`, data)
      return response.data
    },

    async getVersionHistory(params = {}) {
      const response = await axios.get(`${API_URL}/versions`, { params })
      return response.data
    },

    async exportPDF(data) {
      const response = await axios.post(`${API_URL}/pdf/export`, data, {
        responseType: 'blob'
      })
      return response.data
    },

    async getUsers() {
      const response = await axios.get(`${API_URL}/auth/users`)
      return response.data
    }
  }
})
