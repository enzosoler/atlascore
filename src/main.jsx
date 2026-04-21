import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { initSentry } from '@/lib/sentry'
import { registerServiceWorker } from '@/lib/register-sw'
import { wrapRender } from '@/boot/errorCapture'

initSentry()

// Use wrapRender to capture synchronous render errors and show a helpful overlay
wrapRender(() => ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
))

registerServiceWorker()
