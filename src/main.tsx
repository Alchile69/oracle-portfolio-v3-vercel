import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Configuration Sentry (optionnelle)
if (typeof window !== 'undefined') {
  // Désactiver les warnings Sentry Replay si pas configuré
  console.log('🔧 Oracle Portfolio V3.0 - Initialisation');
}

// Enregistrement du Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker enregistré avec succès:', registration.scope);
      })
      .catch((error) => {
        console.warn('⚠️ Échec de l\'enregistrement du Service Worker:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

