/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'
import { VDataTable } from 'vuetify/labs/VDataTable'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  components: {
    VDataTable,
  },
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#030e2e',
          secondary: '#f7c84b'
        },
      },
      dark: {
        colors: {
          primary: '#2b76ff',
          secondary: '#ffe64d'
        }
      }
    },
  },
})
