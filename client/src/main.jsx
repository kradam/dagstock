import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://926c26951e17c122ac7f6c4455430c5c@o4510008011194368.ingest.de.sentry.io/4510008012898384",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true
});

createRoot(document.getElementById('root')).render(
  //TODO strict mode - learn
  <StrictMode>
    <App />
  </StrictMode>,
)
