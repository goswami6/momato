import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { LocationProvider } from './context/LocationContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
