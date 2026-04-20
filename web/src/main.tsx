import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { assertClientEnv } from './env';
import App from './App';
import './index.css';

assertClientEnv();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
