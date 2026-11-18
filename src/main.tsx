import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/app.css'
import './styles/refresh.css'
import App from './App.tsx'
import { E2E } from './lib/e2e'
import { useAppStore } from './store/useAppStore'

// Screen-test mode only (stripped from real builds): let the test script seed state.
if (E2E) (window as unknown as { __store: typeof useAppStore }).__store = useAppStore

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
