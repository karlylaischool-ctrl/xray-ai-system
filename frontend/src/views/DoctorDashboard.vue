<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Doctor Dashboard</h1>
        <p class="text-subtitle-1">Welcome, Dr. {{ authStore.user?.name }}</p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card color="primary" dark @click="$router.push('/patients')" style="cursor: pointer">
          <v-card-title>Total Patients</v-card-title>
          <v-card-text class="text-h3">{{ stats.totalPatients }}</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="secondary" dark @click="$router.push('/reports')" style="cursor: pointer">
          <v-card-title>Pending Reports</v-card-title>
          <v-card-text class="text-h3">{{ stats.pendingReports }}</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="success" dark @click="$router.push('/reports')" style="cursor: pointer">
          <v-card-title>Approved Reports</v-card-title>
          <v-card-text class="text-h3">{{ stats.approvedReports }}</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="accent" dark @click="$router.push('/appointments')" style="cursor: pointer">
          <v-card-title>Upcoming Appointments</v-card-title>
          <v-card-text class="text-h3">{{ stats.appointments }}</v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>Recent Reports</v-card-title>
          <v-card-text>
            <v-list lines="one">
              <v-list-item
                v-for="report in recentReports"
                :key="report._id"
                @click="$router.push(`/reports/${report._id}`)"
              >
                <v-list-item-title>{{ report.reportId }} - {{ report.bodyPart }}</v-list-item-title>
                <v-list-item-subtitle>{{ new Date(report.createdAt).toLocaleDateString() }} - {{ report.status }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useApiStore } from '@/stores/api'

const authStore = useAuthStore()
const apiStore = useApiStore()

const stats = ref({
  totalPatients: 0,
  pendingReports: 0,
  approvedReports: 0,
  appointments: 0
})

const recentReports = ref([])

onMounted(async () => {
  try {
    const patientsData = await apiStore.getPatients()
    stats.value.totalPatients = patientsData.patients.length

    const reportsData = await apiStore.getReports()
    stats.value.pendingReports = reportsData.reports.filter(r => r.status === 'pending').length
    stats.value.approvedReports = reportsData.reports.filter(r => r.status === 'approved').length
    recentReports.value = reportsData.reports.slice(0, 5)

    const appointmentsData = await apiStore.getAppointments()
    stats.value.appointments = appointmentsData.appointments.length
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
})
</script>
