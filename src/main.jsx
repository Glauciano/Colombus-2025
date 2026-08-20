import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

// Seed data is no longer needed — all data is in Supabase
// import { seedData } from './lib/seedData'
// seedData()

// Clean up old localStorage seed data to prevent duplication
const KEYS_TO_CLEAN = [
  'colombus_provas', 'colombus_custo_logistico', 'colombus_custo_ribeirao',
  'colombus_custo_franca', 'colombus_receiveis_ribeirao', 'colombus_receiveis_franca',
  'colombus_socio_limeira', 'colombus_venda_anilha', 'colombus_configuracao',
  'colombus_supabase_enabled'
];
KEYS_TO_CLEAN.forEach(k => localStorage.removeItem(k));

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
)
