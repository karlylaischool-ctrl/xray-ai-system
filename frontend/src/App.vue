<template>
  <v-app>
    <v-navigation-drawer v-if="isAuthenticated" app>
      <v-list>
        <v-list-item
          prepend-avatar="https://cdn.vuetifyjs.com/images/john.png"
          :title="user?.name"
          :subtitle="user?.role"
        ></v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          v-if="user?.role === 'doctor'"
          prepend-icon="mdi-doctor"
          title="Dashboard"
          value="dashboard"
          to="/doctor-dashboard"
        ></v-list-item>
        <v-list-item
          v-if="user?.role === 'patient'"
          prepend-icon="mdi-account"
          title="My Records"
          value="patient-dashboard"
          to="/patient-dashboard"
        ></v-list-item>
        <v-list-item
          v-if="user?.role === 'doctor'"
          prepend-icon="mdi-folder-multiple"
          title="Patients"
          value="patients"
          to="/patients"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-file-medical"
          title="Reports"
          value="reports"
          to="/reports"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-calendar"
          title="Appointments"
          value="appointments"
          to="/appointments"
        ></v-list-item>
        <v-list-item
          v-if="user?.role === 'patient'"
          prepend-icon="mdi-robot"
          title="AI Assistant"
          value="chatbot"
          to="/chatbot"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-history"
          title="Version History"
          value="versions"
          to="/versions"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon v-if="isAuthenticated" @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>X-Ray AI System</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="isAuthenticated" text @click="logout">Logout</v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const drawer = ref(true)

const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
