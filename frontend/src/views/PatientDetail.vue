<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-btn text @click="$router.back()">
          <v-icon left>mdi-arrow-left</v-icon>
          Back
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="patient">
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Patient: {{ patient.demographics.firstName }} {{ patient.demographics.lastName }}</h1>
      </v-col>
    </v-row>

    <v-row v-if="patient">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Demographics</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Patient ID</v-list-item-title>
                <v-list-item-subtitle>{{ patient.patientId }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Full Name</v-list-item-title>
                <v-list-item-subtitle>{{ patient.demographics.firstName }} {{ patient.demographics.lastName }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Date of Birth</v-list-item-title>
                <v-list-item-subtitle>{{ new Date(patient.demographics.dateOfBirth).toLocaleDateString() }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Gender</v-list-item-title>
                <v-list-item-subtitle>{{ patient.demographics.gender }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Phone</v-list-item-title>
                <v-list-item-subtitle>{{ patient.demographics.phone || 'N/A' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Address</v-list-item-title>
                <v-list-item-subtitle>{{ patient.demographics.address || 'N/A' }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Medical History</v-card-title>
          <v-card-text>
            <v-list v-if="patient.medicalHistory && patient.medicalHistory.length">
              <v-list-item v-for="(history, index) in patient.medicalHistory" :key="index">
                <v-list-item-title>{{ history.condition }}</v-list-item-title>
                <v-list-item-subtitle>{{ new Date(history.diagnosedDate).toLocaleDateString() }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <p v-else>No medical history recorded</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Allergies</v-card-title>
          <v-card-text>
            <v-list v-if="patient.allergies && patient.allergies.length">
              <v-list-item v-for="(allergy, index) in patient.allergies" :key="index">
                <v-list-item-title>{{ allergy.allergen }}</v-list-item-title>
                <v-list-item-subtitle>{{ allergy.severity }} - {{ allergy.reaction }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <p v-else>No allergies recorded</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApiStore } from '@/stores/api'

const route = useRoute()
const apiStore = useApiStore()

const patient = ref(null)

onMounted(async () => {
  const data = await apiStore.getPatients()
  patient.value = data.patients.find(p => p._id === route.params.id)
})
</script>
