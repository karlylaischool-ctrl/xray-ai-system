<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-btn text @click="$router.back()">
          <v-icon start>mdi-arrow-left</v-icon>
          Back
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Create New Report</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Upload X-Ray Image</v-card-title>
          <v-card-text>
            <v-file-input
              v-model="imageFile"
              label="Select X-Ray Image"
              accept="image/*"
              @change="handleImageUpload"
            ></v-file-input>
            <v-img v-if="imagePreview" :src="imagePreview" max-height="300" contain class="mt-4"></v-img>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Report Details</v-card-title>
          <v-card-text>
            <v-select
              v-model="form.patientId"
              :items="patients"
              :item-title="(item) => item.demographics ? `${item.patientId} - ${item.demographics.firstName} ${item.demographics.lastName}` : item.patientId"
              item-value="_id"
              label="Patient"
              required
            ></v-select>
            <v-text-field v-model="form.studyType" label="Study Type" required></v-text-field>
            <v-text-field v-model="form.bodyPart" label="Body Part" required></v-text-field>
            <v-textarea v-model="form.findingsPrompt" label="Findings Prompt" rows="3" required hint="Detailed prompt for generating findings (e.g., 'Describe all visible structures, bones, and any abnormalities in the hand')"></v-textarea>
            <v-textarea v-model="form.impressionPrompt" label="Impression Prompt" rows="3" required hint="Prompt for generating clinical impression and diagnosis (e.g., 'Provide a clinical diagnosis and recommend any follow-up actions')"></v-textarea>
            <v-btn
              color="primary"
              @click="analyzeImage"
              :loading="analyzing"
              :disabled="!imageFile"
              block
              class="mt-4"
            >
              <v-icon start>mdi-brain</v-icon>
              Analyze with AI
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="aiAnalysis" class="mt-4">
      <v-col cols="12">
        <v-card color="info" dark>
          <v-card-title>AI Analysis Results</v-card-title>
          <v-card-text>
            <p><strong>Findings:</strong> {{ aiAnalysis.findings }}</p>
            <p><strong>Impression:</strong> {{ aiAnalysis.impression }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="aiAnalysis" class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>Doctor Interpretation</v-card-title>
          <v-card-text>
            <v-textarea v-model="doctorInterpretation.diagnosis" label="Diagnosis" rows="2"></v-textarea>
            <v-textarea v-model="doctorInterpretation.clinicalNotes" label="Clinical Notes" rows="3"></v-textarea>
            <v-textarea v-model="doctorInterpretation.recommendations" label="Recommendations" rows="3"></v-textarea>
            <v-btn color="success" @click="saveReport" :loading="saving" block class="mt-4">
              <v-icon start>mdi-content-save</v-icon>
              Save Report
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useApiStore } from '@/stores/api'

const router = useRouter()
const apiStore = useApiStore()

const patients = ref([])
const imageFile = ref(null)
const imagePreview = ref(null)
const imagePath = ref('')
const analyzing = ref(false)
const saving = ref(false)
const aiAnalysis = ref(null)

const form = ref({
  patientId: '',
  studyType: 'X-Ray',
  bodyPart: '',
  findingsPrompt: '',
  impressionPrompt: ''
})

const doctorInterpretation = ref({
  diagnosis: '',
  clinicalNotes: '',
  recommendations: ''
})

onMounted(async () => {
  const data = await apiStore.getPatients()
  patients.value = data.patients
})

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
    imagePath.value = file.name
  }
}

const analyzeImage = async () => {
  analyzing.value = true
  try {
    const formData = new FormData()
    formData.append('image', imageFile.value)
    formData.append('findingsPrompt', form.value.findingsPrompt)
    formData.append('impressionPrompt', form.value.impressionPrompt)
    
    const result = await apiStore.analyzeXRay(formData)
    aiAnalysis.value = result.analysis
    // Store the server's file path for later use
    if (result.imagePath) {
      imagePath.value = result.imagePath
    }
  } catch (error) {
    console.error('Analysis error:', error)
    alert('Analysis failed. Please try again.')
  }
  analyzing.value = false
}

const saveReport = async () => {
  saving.value = true
  try {
    const reportData = {
      ...form.value,
      imagePaths: [{ path: imagePath.value, uploadedAt: new Date() }],
      aiAnalysis: aiAnalysis.value,
      doctorInterpretation: doctorInterpretation.value,
      findingsPrompt: form.value.findingsPrompt,
      impressionPrompt: form.value.impressionPrompt
    }
    console.log('Saving report with data:', reportData)
    console.log('Doctor interpretation:', doctorInterpretation.value)
    
    await apiStore.createReport(reportData)
    router.push('/reports')
  } catch (error) {
    console.error('Save error:', error)
    alert('Failed to save report. Please try again.')
  }
  saving.value = false
}
</script>
