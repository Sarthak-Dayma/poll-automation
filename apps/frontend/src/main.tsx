<<<<<<< HEAD
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index1.css'
import './guest.css'
import App from './App2.tsx'
=======
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
>>>>>>> 9ee913167a2d6a89eff541e3f79d80bd6c0c6e3d

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
