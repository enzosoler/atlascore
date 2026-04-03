import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { initSentry } from '@/lib/sentry'
import { registerServiceWorker } from '@/lib/register-sw'

initSentry()

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

registerServiceWorker()
