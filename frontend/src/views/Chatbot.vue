<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">AI Medical Assistant</h1>
        <p class="text-subtitle-1">Ask questions about your medical reports in simple terms</p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card height="500" class="d-flex flex-column">
          <v-card-title class="primary white--text">
            <v-icon left color="white">mdi-robot</v-icon>
            Chat with AI Assistant
          </v-card-title>
          <v-card-text class="flex-grow-1 overflow-y-auto pa-4">
            <div v-for="(message, index) in messages" :key="index" class="mb-4">
              <v-chip
                :color="message.role === 'user' ? 'primary' : 'secondary'"
                :class="message.role === 'user' ? 'ml-auto' : 'mr-auto'"
                class="d-block mb-2"
              >
                {{ message.role === 'user' ? 'You' : 'AI Assistant' }}
              </v-chip>
              <v-card
                :color="message.role === 'user' ? 'blue lighten-5' : 'grey lighten-4'"
                class="pa-3"
                :class="message.role === 'user' ? 'ml-auto' : 'mr-auto'"
                max-width="80%"
              >
                {{ message.content }}
              </v-card>
            </div>
            <div v-if="loading" class="text-center">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <p class="mt-2">AI is thinking...</p>
            </div>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-text-field
              v-model="question"
              label="Ask a question about your report"
              @keyup.enter="askQuestion"
              :disabled="loading"
              append-icon="mdi-send"
              @click:append="askQuestion"
            ></v-text-field>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-alert type="info" icon="mdi-information">
          <strong>Disclaimer:</strong> This AI assistant is for educational purposes only. Always consult your doctor for medical advice.
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useApiStore } from '@/stores/api'

const apiStore = useApiStore()

const question = ref('')
const messages = ref([
  {
    role: 'assistant',
    content: 'Hello! I\'m your AI medical assistant. Feel free to ask me questions about your X-ray reports in simple terms. Remember, I\'m here to help you understand, but always consult your doctor for medical advice.'
  }
])
const loading = ref(false)

const askQuestion = async () => {
  if (!question.value.trim()) return

  messages.value.push({
    role: 'user',
    content: question.value
  })

  const userQuestion = question.value
  question.value = ''
  loading.value = true

  try {
    const result = await apiStore.askChatbot({
      question: userQuestion,
      context: 'This is about an X-ray medical report'
    })

    messages.value.push({
      role: 'assistant',
      content: result.answer
    })
  } catch (error) {
    messages.value.push({
      role: 'assistant',
      content: 'Sorry, I encountered an error. Please try again.'
    })
  }

  loading.value = false
}
</script>
