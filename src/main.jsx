import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './admin.css';

const isAdmin = location.pathname.replace(/\/$/, '') === '/admin';
const Application = lazy(() => isAdmin ? import('./AdminApp.jsx') : import('./SiteApp.jsx'));

createRoot(document.getElementById('root')).render(
  <Suspense fallback={<div style={{ minHeight: '100vh', background: isAdmin ? '#f4f8fa' : '#fff' }} />}>
    <Application />
  </Suspense>
);
