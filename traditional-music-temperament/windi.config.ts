import { defineConfig } from 'windicss/helpers'

export default defineConfig({
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ed',
          100: '#fdecd4',
          200: '#fad5a8',
          300: '#f6b871',
          400: '#f19038',
          500: '#ee7412',
          600: '#df5a08',
          700: '#b94209',
          800: '#93350f',
          900: '#772d10',
        },
        ancient: {
          gold: '#d4a574',
          bronze: '#cd7f32',
          jade: '#00a86b',
          ink: '#2c2c2c',
          paper: '#f5f0e6',
          silk: '#e8dcc8',
        }
      },
      fontFamily: {
        kai: ['KaiTi', 'STKaiti', 'serif'],
        song: ['SimSun', 'STSong', 'serif'],
      }
    }
  }
})
