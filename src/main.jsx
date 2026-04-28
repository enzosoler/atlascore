import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { registerServiceWorker } from '@/lib/register-sw'
import { wrapRender } from '@/boot/errorCapture'

// Use wrapRender to capture synchronous render errors and show a helpful overlay
wrapRender(() => ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
))

registerServiceWorker()

// Defer Sentry and its SDK import until after the first render has settled.
const startSentry = () => {
  import('@/lib/sentry')
    .then(({ initSentry }) => initSentry())
    .catch(() => {})
}

if ('requestIdleCallback' in window) {
  window.requestIdleCallback(startSentry, { timeout: 3000 })
} else {
  window.setTimeout(startSentry, 1500)
}
