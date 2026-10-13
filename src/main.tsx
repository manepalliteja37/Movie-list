import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Smoothly dismiss the immediate mobile app opening splash screen once React boots
const pwaSplash = document.getElementById('pwa-launch-splash');
if (pwaSplash) {
  setTimeout(() => {
    pwaSplash.style.opacity = '0';
    pwaSplash.style.pointerEvents = 'none';
    setTimeout(() => {
      pwaSplash.remove();
    }, 450);
  }, 1300);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

