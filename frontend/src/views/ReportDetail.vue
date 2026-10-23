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

    <v-row v-if="report">
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Report: {{ report.reportId }}</h1>
      </v-col>
    </v-row>

    <v-row v-if="report">
      <v-col cols="12">
        <v-card>
          <v-card-title>Report Information</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Report ID</v-list-item-title>
                <v-list-item-subtitle>{{ report.reportId }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Study Type</v-list-item-title>
                <v-list-item-subtitle>{{ report.studyType }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Body Part</v-list-item-title>
                <v-list-item-subtitle>{{ report.bodyPart }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Status</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip :color="getStatusColor(report.status)">{{ report.status }}</v-chip>
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Created</v-list-item-title>
                <v-list-item-subtitle>{{ new Date(report.createdAt).toLocaleString() }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" v-if="report.imagePaths && report.imagePaths.length">
        <v-card>
          <v-card-title>X-Ray Images</v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="(image, index) in report.imagePaths" :key="index" cols="12" md="6">
                <v-img :src="getImageUrl(image.path)" max-height="400" contain></v-img>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>AI Analysis</v-card-title>
          <v-card-text>
            <v-divider class="my-2"></v-divider>
            <div class="mb-4">
              <p class="text-subtitle-2 font-weight-bold">Findings Prompt Used:</p>
              <p class="text-body-2">{{ report.findingsPrompt || 'N/A' }}</p>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="mb-4">
              <p class="text-subtitle-2 font-weight-bold">Impression Prompt Used:</p>
              <p class="text-body-2">{{ report.impressionPrompt || 'N/A' }}</p>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="mb-4">
              <p class="text-subtitle-2 font-weight-bold">Findings:</p>
              <p class="text-body-2">{{ report.aiAnalysis?.findings || 'N/A' }}</p>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="mb-4">
              <p class="text-subtitle-2 font-weight-bold">Impression:</p>
              <p class="text-body-2">{{ report.aiAnalysis?.impression || 'N/A' }}</p>
            </div>
            <v-textarea
              v-if="authStore.user?.role === 'doctor'"
              v-model="customPrompt"
              label="Custom AI Prompt for Re-analysis"
              rows="3"
              class="mt-4"
            ></v-textarea>
            <v-btn
              v-if="authStore.user?.role === 'doctor'"
              color="primary"
              @click="reanalyze"
              :loading="reanalyzing"
              class="mt-2"
            >
              <v-icon start>mdi-refresh</v-icon>
              Re-analyze with AI
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Doctor Interpretation</v-card-title>
          <v-card-text>
            <div v-if="isEditing">
              <v-textarea
                v-model="doctorInterpretation.diagnosis"
                label="Diagnosis"
                rows="2"
                class="mb-2"
              ></v-textarea>
              <v-textarea
                v-model="doctorInterpretation.clinicalNotes"
                label="Clinical Notes"
                rows="3"
                class="mb-2"
              ></v-textarea>
              <v-textarea
                v-model="doctorInterpretation.recommendations"
                label="Recommendations"
                rows="3"
                class="mb-2"
              ></v-textarea>
              <v-btn
                color="primary"
                @click="saveDoctorInterpretation"
                class="mt-2 mr-2"
              >
                <v-icon start>mdi-content-save</v-icon>
                Save
              </v-btn>
              <v-btn
                color="grey"
                @click="isEditing = false"
                class="mt-2"
              >
                Cancel
              </v-btn>
            </div>
            <div v-else>
              <p><strong>Diagnosis:</strong> {{ report.doctorInterpretation?.diagnosis || 'N/A' }}</p>
              <p><strong>Clinical Notes:</strong> {{ report.doctorInterpretation?.clinicalNotes || 'N/A' }}</p>
              <p><strong>Recommendations:</strong> {{ report.doctorInterpretation?.recommendations || 'N/A' }}</p>
              <v-btn
                v-if="authStore.user?.role === 'doctor'"
                color="primary"
                @click="isEditing = true"
                class="mt-2"
              >
                <v-icon start>mdi-pencil</v-icon>
                Edit Interpretation
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" v-if="report.laymenInterpretation">
        <v-card>
          <v-card-title>Laymen Interpretation</v-card-title>
          <v-card-text>
            <p><strong>Simplified Explanation:</strong> {{ report.laymenInterpretation.simplifiedExplanation || 'N/A' }}</p>
            <p><strong>Educational Notes:</strong> {{ report.laymenInterpretation.educationalNotes || 'N/A' }}</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" v-if="authStore.user?.role === 'doctor' && report.status !== 'approved'">
        <v-btn color="success" @click="approveReport" :loading="approving">
          <v-icon start>mdi-check</v-icon>
          Approve Report
        </v-btn>
      </v-col>

      <v-col cols="12" v-if="authStore.user?.role === 'patient'">
        <v-btn color="primary" @click="exportPDF" :loading="exportingPDF">
          <v-icon start>mdi-file-pdf</v-icon>
          Export PDF
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useApiStore } from '@/stores/api'

const route = useRoute()
const authStore = useAuthStore()
const apiStore = useApiStore()

const report = ref(null)
const approving = ref(false)
const reanalyzing = ref(false)
const exportingPDF = ref(false)
const customPrompt = ref('')
const isEditing = ref(false)
const doctorInterpretation = ref({
  diagnosis: '',
  clinicalNotes: '',
  recommendations: ''
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

onMounted(async () => {
  const data = await apiStore.getReports()
  report.value = data.reports.find(r => r._id === route.params.id)
  
  console.log('Report loaded:', report.value)
  console.log('Image paths:', report.value?.imagePaths)
  console.log('Doctor interpretation:', report.value?.doctorInterpretation)
  
  // Initialize doctor interpretation from report
  if (report.value?.doctorInterpretation) {
    doctorInterpretation.value = { ...report.value.doctorInterpretation }
  } else {
    // Initialize empty if not present
    doctorInterpretation.value = {
      diagnosis: '',
      clinicalNotes: '',
      recommendations: ''
    }
  }
})

const approveReport = async () => {
  approving.value = true
  await apiStore.approveReport(report.value._id)
  const data = await apiStore.getReports()
  report.value = data.reports.find(r => r._id === route.params.id)
  approving.value = false
}

const exportPDF = async () => {
  if (!confirm('Do you consent to export this report as PDF?')) return

  exportingPDF.value = true
  try {
    const blob = await apiStore.exportPDF({ reportId: report.value._id, consent: true })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `report_${report.value.reportId}.pdf`
    link.click()
    window.setTimeout(() => window.URL.revokeObjectURL(url), 1000)
  } catch (error) {
    console.error('PDF export error:', error)
    alert(error.response?.data?.message || 'PDF export failed. Please try again.')
  } finally {
    exportingPDF.value = false
  }
}

const reanalyze = async () => {
  reanalyzing.value = true
  try {
    // Get the first image path from the report
    const imagePath = report.value.imagePaths?.[0]?.path
    if (!imagePath) {
      alert('No image available for re-analysis')
      return
    }
    
    // For re-analysis, we can't upload the file again, so we send the path
    // The backend will handle the path properly
    const result = await apiStore.analyzeXRay({
      imagePath,
      prompt: customPrompt.value
    })
    
    // Update the report with new analysis
    await apiStore.updateReport(report.value._id, {
      aiAnalysis: result.analysis
    })
    
    // Refresh the report
    const data = await apiStore.getReports()
    report.value = data.reports.find(r => r._id === route.params.id)
    
    alert('Re-analysis complete')
  } catch (error) {
    console.error('Re-analysis error:', error)
    alert('Re-analysis failed. Please try again.')
  }
  reanalyzing.value = false
}

const getImageUrl = (path) => {
  console.log('Getting image URL for:', path)
  // If it's already a full URL, return it
  if (path.startsWith('http')) {
    return path
  }
  // If it's a relative path, prepend the uploads endpoint
  if (path.startsWith('uploads/')) {
    return `http://localhost:5001/${path}`
  }
  // Otherwise return as is
  return path
}

const saveDoctorInterpretation = async () => {
  try {
    await apiStore.updateReport(report.value._id, {
      doctorInterpretation: doctorInterpretation.value
    })
    
    // Refresh the report
    const data = await apiStore.getReports()
    report.value = data.reports.find(r => r._id === route.params.id)
    
    isEditing.value = false
    alert('Doctor interpretation saved successfully')
  } catch (error) {
    console.error('Save error:', error)
    alert('Failed to save interpretation. Please try again.')
  }
}
</script>
