import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import '../assets/meta-pixel.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
