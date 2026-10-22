<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Version History</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-row>
              <v-col cols="12" sm="2">
                <v-select
                  v-model="entityTypeFilter"
                  :items="['all', 'patient', 'report', 'appointment']"
                  label="Entity Type"
                  density="compact"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="2">
                <v-select
                  v-model="changeTypeFilter"
                  :items="['all', 'create', 'update', 'delete']"
                  label="Change Type"
                  density="compact"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="2">
                <v-select
                  v-if="authStore.user?.role === 'patient'"
                  v-model="doctorFilter"
                  :items="doctorOptions"
                  item-title="name"
                  item-value="_id"
                  label="Doctor"
                  density="compact"
                  clearable
                ></v-select>
                <v-select
                  v-if="authStore.user?.role === 'doctor'"
                  v-model="patientFilter"
                  :items="patientOptions"
                  item-title="displayName"
                  item-value="_id"
                  label="Patient"
                  density="compact"
                  clearable
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
              <v-col cols="12" sm="4">
                <v-btn color="primary" @click="applyFilters" block>
                  <v-icon start>mdi-filter</v-icon>
                  Apply Filters
                </v-btn>
              </v-col>
            </v-row>
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="filteredVersions"
            @click:row="(item) => viewVersion(item)"
          >
            <template v-slot:item.entityType="{ item }">
              <v-chip :color="getEntityTypeColor(item.entityType)">{{ item.entityType }}</v-chip>
            </template>
            <template v-slot:item.patientName="{ item }">
              {{ getPatientName(item) }}
            </template>
            <template v-slot:item.changeType="{ item }">
              <v-chip :color="getChangeTypeColor(item.changeType)">{{ item.changeType }}</v-chip>
            </template>
            <template v-slot:item.timestamp="{ item }">
              {{ new Date(item.timestamp).toLocaleString() }}
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showDialog" max-width="800px">
      <v-card>
        <v-card-title>Version Details</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item>
              <v-list-item-title>Entity Type</v-list-item-title>
              <v-list-item-subtitle>{{ selectedVersion?.entityType }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Version</v-list-item-title>
              <v-list-item-subtitle>{{ selectedVersion?.version }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Change Type</v-list-item-title>
              <v-list-item-subtitle>{{ selectedVersion?.changeType }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Changed By</v-list-item-title>
              <v-list-item-subtitle>{{ selectedVersion?.changedBy?.name }} ({{ selectedVersion?.changedBy?.email }})</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Timestamp</v-list-item-title>
              <v-list-item-subtitle>{{ new Date(selectedVersion?.timestamp).toLocaleString() }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Description</v-list-item-title>
              <v-list-item-subtitle>{{ selectedVersion?.changeDescription || 'N/A' }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <v-divider class="my-4"></v-divider>
          <h3>Changes</h3>
          <pre class="mt-2">{{ JSON.stringify(selectedVersion?.changes, null, 2) }}</pre>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApiStore } from '@/stores/api'
import { useAuthStore } from '@/stores/auth'

const apiStore = useApiStore()
const authStore = useAuthStore()

const entityTypeFilter = ref('all')
const changeTypeFilter = ref('all')
const doctorFilter = ref('')
const patientFilter = ref('')
const dateFilter = ref('')
const versions = ref([])
const showDialog = ref(false)
const selectedVersion = ref(null)
const doctorOptions = ref([])
const patientOptions = ref([])

const headers = computed(() => {
  const baseHeaders = [
    { title: 'Entity Type', key: 'entityType' },
    { title: 'Version', key: 'version' },
    { title: 'Change Type', key: 'changeType' },
    { title: 'Changed By', key: 'changedBy.name' },
    { title: 'Timestamp', key: 'timestamp' }
  ]
  
  // Add patient column for doctors
  if (authStore.user?.role === 'doctor') {
    return [
      ...baseHeaders.slice(0, 3),
      { title: 'Patient', key: 'patientName' },
      ...baseHeaders.slice(3)
    ]
  }
  
  return baseHeaders
})

const filteredVersions = computed(() => {
  let result = versions.value
  
  if (entityTypeFilter.value !== 'all') {
    result = result.filter(v => v.entityType === entityTypeFilter.value)
  }
  
  if (changeTypeFilter.value !== 'all') {
    result = result.filter(v => v.changeType === changeTypeFilter.value)
  }
  
  if (doctorFilter.value) {
    result = result.filter(v => v.changedBy?._id === doctorFilter.value)
  }
  
  if (patientFilter.value) {
    result = result.filter(v => v.relatedPatientId?._id === patientFilter.value)
  }
  
  if (dateFilter.value) {
    const filterDate = new Date(dateFilter.value)
    const nextDay = new Date(filterDate)
    nextDay.setDate(nextDay.getDate() + 1)
    result = result.filter(v => {
      const itemDate = new Date(v.timestamp)
      return itemDate >= filterDate && itemDate < nextDay
    })
  }
  
  return result
})

const getEntityTypeColor = (type) => {
  const colors = {
    patient: 'blue',
    report: 'green',
    appointment: 'orange'
  }
  return colors[type] || 'grey'
}

const getChangeTypeColor = (type) => {
  const colors = {
    create: 'green',
    update: 'blue',
    delete: 'red'
  }
  return colors[type] || 'grey'
}

const getPatientName = (version) => {
  if (version.relatedPatientId?.demographics) {
    return `${version.relatedPatientId.patientId} - ${version.relatedPatientId.demographics.firstName} ${version.relatedPatientId.demographics.lastName}`
  }
  return version.relatedPatientId?.patientId || 'N/A'
}

onMounted(async () => {
  const data = await apiStore.getVersionHistory()
  versions.value = data.versions
  
  // Load doctors for filter (for patients)
  if (authStore.user?.role === 'patient') {
    const usersData = await apiStore.getUsers()
    doctorOptions.value = usersData.users?.filter(u => u.role === 'doctor') || []
  }
  
  // Load patients for filter (for doctors - only their assigned patients)
  if (authStore.user?.role === 'doctor') {
    const patientsData = await apiStore.getPatients()
    patientOptions.value = patientsData.patients.map(p => ({
      ...p,
      displayName: `${p.patientId} - ${p.demographics?.firstName || ''} ${p.demographics?.lastName || ''}`
    }))
  }
})

const applyFilters = () => {
  // This triggers the computed property to re-evaluate
  // No action needed as filteredVersions is computed
}

const viewVersion = (version) => {
  selectedVersion.value = version
  showDialog.value = true
}
</script>
