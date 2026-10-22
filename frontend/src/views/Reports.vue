<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Reports</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-row>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="search"
                  append-inner-icon="mdi-magnify"
                  label="Search"
                  single-line
                  hide-details
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="2">
                <v-select
                  v-model="statusFilter"
                  :items="['all', 'pending', 'under_review', 'approved', 'rejected']"
                  label="Status"
                  density="compact"
                  hide-details
                ></v-select>
              </v-col>
              <v-col cols="12" sm="2">
                <v-select
                  v-model="bodyPartFilter"
                  :items="['all', 'chest', 'hand', 'pelvic', 'abdomen', 'spine', 'head', 'limbs']"
                  label="Body Part"
                  density="compact"
                  hide-details
                ></v-select>
              </v-col>
              <v-col cols="12" sm="2">
                <v-text-field
                  v-model="dateFilter"
                  type="date"
                  label="Date"
                  density="compact"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-btn v-if="authStore.user?.role === 'doctor'" color="primary" to="/reports/new" block>
                  <v-icon start>mdi-plus</v-icon>
                  New Report
                </v-btn>
              </v-col>
            </v-row>
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="filteredReports"
            :search="search"
            @click:row="(item) => $router.push(`/reports/${item._id}`)"
          >
            <template v-slot:item.patientName="{ item }">
              {{ getPatientName(item) }}
            </template>
            <template v-slot:item.status="{ item }">
              <v-chip :color="getStatusColor(item.status)">{{ item.status }}</v-chip>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-icon v-if="authStore.user?.role === 'doctor'" size="small" class="mr-2" @click.stop="$router.push(`/reports/${item._id}`)">mdi-eye</v-icon>
              <v-icon v-if="authStore.user?.role === 'doctor'" size="small" class="mr-2" @click.stop="editReport(item)">mdi-pencil</v-icon>
              <v-icon v-if="authStore.user?.role === 'doctor'" size="small" @click.stop="deleteReport(item)">mdi-delete</v-icon>
              <v-icon v-if="authStore.user?.role === 'patient'" size="small" @click.stop="$router.push(`/reports/${item._id}`)">mdi-eye</v-icon>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useApiStore } from '@/stores/api'

const router = useRouter()
const authStore = useAuthStore()
const apiStore = useApiStore()

const search = ref('')
const statusFilter = ref('all')
const bodyPartFilter = ref('all')
const dateFilter = ref('')
const reports = ref([])

const headers = [
  { title: 'Report ID', key: 'reportId' },
  { title: 'Patient', key: 'patientName' },
  { title: 'Study Type', key: 'studyType' },
  { title: 'Body Part', key: 'bodyPart' },
  { title: 'Status', key: 'status' },
  { title: 'Date', key: 'createdAt' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const filteredReports = computed(() => {
  let result = reports.value
  
  // Apply status filter
  if (statusFilter.value !== 'all') {
    result = result.filter(r => r.status === statusFilter.value)
  }
  
  // Apply body part filter
  if (bodyPartFilter.value !== 'all') {
    result = result.filter(r => r.bodyPart?.toLowerCase() === bodyPartFilter.value.toLowerCase())
  }
  
  // Apply date filter
  if (dateFilter.value) {
    const filterDate = new Date(dateFilter.value)
    const nextDay = new Date(filterDate)
    nextDay.setDate(nextDay.getDate() + 1)
    result = result.filter(r => {
      const itemDate = new Date(r.createdAt)
      return itemDate >= filterDate && itemDate < nextDay
    })
  }
  
  // Apply search filter (searches report ID, patient name, body part)
  if (search.value) {
    const searchLower = search.value.toLowerCase()
    result = result.filter(r => {
      const patientName = getPatientName(r).toLowerCase()
      return (
        r.reportId?.toLowerCase().includes(searchLower) ||
        patientName.includes(searchLower) ||
        r.bodyPart?.toLowerCase().includes(searchLower) ||
        r.studyType?.toLowerCase().includes(searchLower)
      )
    })
  }
  
  return result
})

const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    under_review: 'blue',
    approved: 'green',
    rejected: 'red'
  }
  return colors[status] || 'grey'
}

const getPatientName = (report) => {
  if (report.patientId?.demographics) {
    return `${report.patientId.patientId} - ${report.patientId.demographics.firstName} ${report.patientId.demographics.lastName}`
  }
  return report.patientId?.patientId || 'N/A'
}

onMounted(async () => {
  const data = await apiStore.getReports()
  reports.value = data.reports
  console.log('Reports loaded:', reports.value)
})

const editReport = (report) => {
  console.log('Edit report:', report)
  // For now, navigate to detail view
  router.push(`/reports/${report._id}`)
}

const deleteReport = async (report) => {
  if (confirm('Are you sure you want to delete this report?')) {
    await apiStore.deleteReport(report._id)
    const data = await apiStore.getReports()
    reports.value = data.reports
  }
}
</script>
