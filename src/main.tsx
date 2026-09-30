import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {trackConversions} from './conversions';

// Counts WhatsApp and order CTA clicks as Google Ads conversions.
trackConversions();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
