<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">My Records</h1>
        <p class="text-subtitle-1">Welcome, {{ authStore.user?.name }}</p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card color="primary" dark @click="$router.push('/reports')" style="cursor: pointer">
          <v-card-title>Total Reports</v-card-title>
          <v-card-text class="text-h3">{{ stats.totalReports }}</v-card-text>
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
          <v-card-title>Appointments</v-card-title>
          <v-card-text class="text-h3">{{ stats.appointments }}</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="secondary" dark @click="$router.push('/chatbot')" style="cursor: pointer">
          <v-card-title>AI Assistant</v-card-title>
          <v-card-text class="text-h3">Chat</v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>My Doctors</v-card-title>
          <v-card-text>
            <v-list lines="one">
              <v-list-item
                v-for="doctor in assignedDoctors"
                :key="doctor._id"
              >
                <v-list-item-title>{{ doctor.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ doctor.hospital }} - {{ doctor.specialization }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="assignedDoctors.length === 0">
                <v-list-item-title>No doctors assigned yet</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
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

    <v-row class="mt-4">
      <v-col cols="12">
        <v-btn color="primary" size="large" to="/chatbot" block>
          <v-icon start>mdi-robot</v-icon>
          Ask AI Assistant
        </v-btn>
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
  totalReports: 0,
  approvedReports: 0,
  appointments: 0,
  doctors: 0
})

const recentReports = ref([])
const assignedDoctors = ref([])

onMounted(async () => {
  try {
    const reportsData = await apiStore.getReports()
    stats.value.totalReports = reportsData.reports.length
    stats.value.approvedReports = reportsData.reports.filter(r => r.status === 'approved').length
    recentReports.value = reportsData.reports.slice(0, 5)

    const appointmentsData = await apiStore.getAppointments()
    stats.value.appointments = appointmentsData.appointments.length

    // Load assigned doctors
    const patientsData = await apiStore.getPatients()
    if (patientsData.patients.length > 0) {
      const patient = patientsData.patients[0]
      assignedDoctors.value = patient.assignedDoctors || []
      stats.value.doctors = assignedDoctors.value.length
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
})
</script>
