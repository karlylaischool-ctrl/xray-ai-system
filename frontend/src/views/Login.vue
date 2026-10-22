<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Welcome to X-Ray AI System</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="Email"
                prepend-icon="mdi-email"
                type="email"
                required
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Password"
                prepend-icon="mdi-lock"
                type="password"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="handleLogin" :loading="loading">Login</v-btn>
          </v-card-actions>
          <v-card-text>
            <v-btn text block color="primary" to="/register">Don't have an account? Register</v-btn>
          </v-card-text>
        </v-card>
        <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  const result = await authStore.login(email.value, password.value)
  
  loading.value = false
  
  if (result.success) {
    if (authStore.user.role === 'doctor') {
      router.push('/doctor-dashboard')
    } else {
      router.push('/patient-dashboard')
    }
  } else {
    error.value = result.message
  }
}
</script>
