<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Create Account</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleRegister">
              <v-text-field
                v-model="name"
                label="Full Name"
                prepend-icon="mdi-account"
                required
              ></v-text-field>
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
              <v-select
                v-model="role"
                :items="['doctor', 'patient']"
                label="Role"
                prepend-icon="mdi-account-circle"
                required
              ></v-select>
              
              <!-- Doctor fields -->
              <v-text-field
                v-if="role === 'doctor'"
                v-model="doctorId"
                label="Doctor ID"
                prepend-icon="mdi-badge-account"
                required
              ></v-text-field>
              <v-text-field
                v-if="role === 'doctor'"
                v-model="hospital"
                label="Hospital"
                prepend-icon="mdi-hospital"
              ></v-text-field>
              <v-text-field
                v-if="role === 'doctor'"
                v-model="specialization"
                label="Specialization"
                prepend-icon="mdi-stethoscope"
              ></v-text-field>
              
              <!-- Patient fields -->
              <v-text-field
                v-if="role === 'patient'"
                v-model="firstName"
                label="First Name"
                prepend-icon="mdi-account"
                required
              ></v-text-field>
              <v-text-field
                v-if="role === 'patient'"
                v-model="lastName"
                label="Last Name"
                prepend-icon="mdi-account"
                required
              ></v-text-field>
              <v-text-field
                v-if="role === 'patient'"
                v-model="dateOfBirth"
                label="Date of Birth"
                prepend-icon="mdi-calendar"
                type="date"
                required
              ></v-text-field>
              <v-select
                v-if="role === 'patient'"
                v-model="gender"
                :items="['male', 'female', 'other']"
                label="Gender"
                prepend-icon="mdi-gender-male-female"
                required
              ></v-select>
              <v-text-field
                v-if="role === 'patient'"
                v-model="phone"
                label="Phone"
                prepend-icon="mdi-phone"
              ></v-text-field>
              <v-text-field
                v-if="role === 'patient'"
                v-model="address"
                label="Address"
                prepend-icon="mdi-map-marker"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="handleRegister" :loading="loading">Register</v-btn>
          </v-card-actions>
          <v-card-text>
            <v-btn text block color="primary" to="/login">Already have an account? Login</v-btn>
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

const name = ref('')
const email = ref('')
const password = ref('')
const role = ref('patient')
const doctorId = ref('')
const hospital = ref('')
const specialization = ref('')
const firstName = ref('')
const lastName = ref('')
const dateOfBirth = ref('')
const gender = ref('')
const phone = ref('')
const address = ref('')
const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  
  const userData = {
    name: name.value,
    email: email.value,
    password: password.value,
    role: role.value
  }
  
  if (role.value === 'doctor') {
    userData.doctorId = doctorId.value
    userData.hospital = hospital.value
    userData.specialization = specialization.value
  }
  
  if (role.value === 'patient') {
    userData.firstName = firstName.value
    userData.lastName = lastName.value
    userData.dateOfBirth = dateOfBirth.value
    userData.gender = gender.value
    userData.phone = phone.value
    userData.address = address.value
  }
  
  const result = await authStore.register(userData)
  
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
