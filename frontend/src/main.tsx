import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'

// Soft UI Dashboard CSS
import './assets/css/nucleo-icons.css'
import './assets/css/nucleo-svg.css'
import './assets/css/soft-ui-dashboard.css'

// Custom overrides (if any)
import './index.css'

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  );
} else {
  console.error("Impossible de trouver l'élément root");
}
