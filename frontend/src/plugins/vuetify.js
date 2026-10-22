import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#4CAF50',
          secondary: '#2196F3',
          accent: '#FF9800',
          error: '#F44336',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FF9800',
          background: '#FAFAFA',
          surface: '#FFFFFF'
        }
      }
    }
  }
})

export default vuetify
