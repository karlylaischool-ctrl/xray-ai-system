<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Patient Records</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-text-field
              v-model="search"
              append-inner-icon="mdi-magnify"
              label="Search patients"
              single-line
              hide-details
            ></v-text-field>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="showDialog = true">
              <v-icon start>mdi-plus</v-icon>
              Add Patient
            </v-btn>
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="patients"
            :search="search"
            @click:row="(item) => $router.push(`/patients/${item._id}`)"
          >
            <template v-slot:item.patientId="{ item }">
              <a href="#" @click.stop="$router.push(`/patients/${item._id}`)" class="text-decoration-none">
                {{ item.patientId }}
              </a>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-icon size="small" class="mr-2" @click.stop="editPatient(item)">mdi-pencil</v-icon>
              <v-icon size="small" @click.stop="deletePatient(item)">mdi-delete</v-icon>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editMode ? 'Edit Patient' : 'Add Patient' }}</span>
        </v-card-title>
        <v-card-text>
          <v-form v-if="!editMode">
            <v-radio-group v-model="addMode" inline>
              <v-radio label="Select Registered Patient" value="select"></v-radio>
              <v-radio label="Create New Patient" value="create"></v-radio>
            </v-radio-group>
            
            <v-select
              v-if="addMode === 'select'"
              v-model="selectedPatientId"
              :items="registeredPatients"
              item-title="displayName"
              item-value="_id"
              label="Select Registered Patient"
              @update:model-value="onPatientSelect"
              return-object
            ></v-select>
          </v-form>
          
          <v-form>
            <v-text-field v-model="form.demographics.firstName" label="First Name" required></v-text-field>
            <v-text-field v-model="form.demographics.lastName" label="Last Name" required></v-text-field>
            <v-text-field v-model="form.demographics.dateOfBirth" type="date" label="Date of Birth" required></v-text-field>
            <v-select v-model="form.demographics.gender" :items="['male', 'female', 'other']" label="Gender" required></v-select>
            <v-text-field v-model="form.demographics.phone" label="Phone"></v-text-field>
            <v-text-field v-model="form.demographics.address" label="Address"></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="savePatient">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApiStore } from '@/stores/api'
import { useAuthStore } from '@/stores/auth'

const apiStore = useApiStore()
const authStore = useAuthStore()

const search = ref('')
const showDialog = ref(false)
const editMode = ref(false)
const addMode = ref('create')
const selectedPatientId = ref(null)
const patients = ref([])
const registeredPatients = ref([])
const form = ref({
  demographics: {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    phone: '',
    address: ''
  }
})

const headers = [
  { title: 'Patient ID', key: 'patientId' },
  { title: 'Name', key: 'demographics.firstName' },
  { title: 'Last Name', key: 'demographics.lastName' },
  { title: 'Gender', key: 'demographics.gender' },
  { title: 'Phone', key: 'demographics.phone' },
  { title: 'Actions', key: 'actions', sortable: false }
]

onMounted(async () => {
  const data = await apiStore.getPatients()
  patients.value = data.patients
  
  // Fetch all registered patients for dropdown (not just assigned ones)
  const allPatientsData = await apiStore.getPatients({ allPatients: 'true' })
  registeredPatients.value = allPatientsData.patients.map(p => ({
    ...p,
    displayName: `${p.patientId} - ${p.demographics?.firstName || ''} ${p.demographics?.lastName || ''}`
  }))
})

const savePatient = async () => {
  if (editMode.value) {
    await apiStore.updatePatient(form.value._id, form.value)
  } else {
    if (addMode.value === 'select' && selectedPatientId.value) {
      // Link selected patient to doctor by adding doctor to assignedDoctors
      const currentDoctors = selectedPatientId.value.assignedDoctors || []
      await apiStore.updatePatient(selectedPatientId.value._id, {
        assignedDoctors: [...currentDoctors, authStore.user.id]
      })
    } else {
      await apiStore.createPatient(form.value)
    }
  }
  showDialog.value = false
  const data = await apiStore.getPatients()
  patients.value = data.patients
  registeredPatients.value = patients.value.map(p => ({
    ...p,
    displayName: `${p.patientId} - ${p.demographics?.firstName || ''} ${p.demographics?.lastName || ''}`
  }))
}

const editPatient = (patient) => {
  form.value = JSON.parse(JSON.stringify(patient))
  editMode.value = true
  showDialog.value = true
}

const onPatientSelect = (patient) => {
  if (patient) {
    form.value = {
      _id: patient._id,
      patientId: patient.patientId,
      demographics: patient.demographics || {}
    }
  }
}

const deletePatient = async (patient) => {
  if (confirm('Are you sure you want to delete this patient?')) {
    await apiStore.deletePatient(patient._id)
    const data = await apiStore.getPatients()
    patients.value = data.patients
  }
}
</script>
