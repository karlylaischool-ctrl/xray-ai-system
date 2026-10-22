<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Appointments</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-spacer></v-spacer>
            <v-btn v-if="authStore.user?.role === 'doctor'" color="primary" @click="showDialog = true">
              <v-icon start>mdi-plus</v-icon>
              Schedule Appointment
            </v-btn>
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="appointments"
            @click:row="(item) => viewAppointment(item)"
          >
            <template v-slot:item.patientName="{ item }">
              {{ getPatientName(item) }}
            </template>
            <template v-slot:item.doctorName="{ item }">
              {{ getDoctorName(item) }}
            </template>
            <template v-slot:item.status="{ item }">
              <v-chip :color="getStatusColor(item.status)">{{ item.status }}</v-chip>
            </template>
            <template v-slot:item.scheduledDate="{ item }">
              {{ new Date(item.scheduledDate).toLocaleString() }}
            </template>
            <template v-slot:item.actions="{ item }">
              <v-icon v-if="authStore.user?.role === 'doctor'" size="small" class="mr-2" @click.stop="editAppointment(item)">mdi-pencil</v-icon>
              <v-icon v-if="authStore.user?.role === 'doctor'" size="small" @click.stop="deleteAppointment(item)">mdi-delete</v-icon>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Schedule Appointment</span>
        </v-card-title>
        <v-card-text>
          <v-form>
            <v-select
              v-if="authStore.user?.role === 'doctor'"
              v-model="form.patientId"
              :items="patients"
              :item-title="(item) => item.demographics ? `${item.patientId} - ${item.demographics.firstName} ${item.demographics.lastName}` : item.patientId"
              item-value="_id"
              label="Patient"
              required
            ></v-select>
            <v-select
              v-if="authStore.user?.role === 'patient'"
              v-model="form.doctorId"
              :items="doctors"
              item-title="name"
              item-value="_id"
              label="Doctor"
              required
            ></v-select>
            <v-text-field v-model="form.scheduledDate" type="datetime-local" label="Date & Time" required></v-text-field>
            <v-text-field v-model="form.duration" type="number" label="Duration (minutes)" required></v-text-field>
            <v-select
              v-model="form.type"
              :items="['consultation', 'follow_up', 'imaging', 'emergency']"
              label="Type"
              required
            ></v-select>
            <v-textarea v-model="form.notes" label="Notes" rows="3"></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveAppointment">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useApiStore } from '@/stores/api'

const authStore = useAuthStore()
const apiStore = useApiStore()

const showDialog = ref(false)
const appointments = ref([])
const patients = ref([])
const doctors = ref([])

const form = ref({
  patientId: '',
  doctorId: '',
  scheduledDate: '',
  duration: 30,
  type: 'consultation',
  notes: ''
})

const headers = computed(() => {
  if (authStore.user?.role === 'doctor') {
    return [
      { title: 'Appointment ID', key: 'appointmentId' },
      { title: 'Patient', key: 'patientName' },
      { title: 'Date', key: 'scheduledDate' },
      { title: 'Type', key: 'type' },
      { title: 'Status', key: 'status' },
      { title: 'Duration', key: 'duration' },
      { title: 'Actions', key: 'actions', sortable: false }
    ]
  } else {
    return [
      { title: 'Appointment ID', key: 'appointmentId' },
      { title: 'Doctor', key: 'doctorName' },
      { title: 'Date', key: 'scheduledDate' },
      { title: 'Type', key: 'type' },
      { title: 'Status', key: 'status' },
      { title: 'Duration', key: 'duration' },
      { title: 'Actions', key: 'actions', sortable: false }
    ]
  }
})

const getStatusColor = (status) => {
  const colors = {
    scheduled: 'blue',
    confirmed: 'green',
    completed: 'grey',
    cancelled: 'red',
    no_show: 'orange'
  }
  return colors[status] || 'grey'
}

const getPatientName = (appointment) => {
  if (appointment.patientId?.demographics) {
    return `${appointment.patientId.patientId} - ${appointment.patientId.demographics.firstName} ${appointment.patientId.demographics.lastName}`
  }
  return appointment.patientId?.patientId || 'N/A'
}

const getDoctorName = (appointment) => {
  if (appointment.doctorId) {
    return `${appointment.doctorId.name} (${appointment.doctorId.doctorId || 'N/A'})`
  }
  return 'N/A'
}

onMounted(async () => {
  const data = await apiStore.getAppointments()
  appointments.value = data.appointments

  if (authStore.user?.role === 'doctor') {
    const patientsData = await apiStore.getPatients()
    patients.value = patientsData.patients
  } else {
    // For patients, load available doctors
    const doctorsData = await apiStore.getUsers()
    doctors.value = doctorsData.users?.filter(u => u.role === 'doctor') || []
  }
})

const saveAppointment = async () => {
  if (authStore.user?.role === 'doctor') {
    form.value.doctorId = authStore.user.id
  } else {
    // For patients, we need to use their patient ID, not user ID
    // The backend will handle the mapping, but we need to pass the user ID
    // The backend will look up the patient record
    form.value.patientId = authStore.user.id
  }

  await apiStore.createAppointment(form.value)
  showDialog.value = false
  const data = await apiStore.getAppointments()
  appointments.value = data.appointments
}

const viewAppointment = (appointment) => {
  console.log('View appointment:', appointment)
}

const editAppointment = (appointment) => {
  form.value = JSON.parse(JSON.stringify(appointment))
  showDialog.value = true
}

const deleteAppointment = async (appointment) => {
  if (confirm('Are you sure you want to delete this appointment?')) {
    await apiStore.deleteAppointment(appointment._id)
    const data = await apiStore.getAppointments()
    appointments.value = data.appointments
  }
}
</script>
