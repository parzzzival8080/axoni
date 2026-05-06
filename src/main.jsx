import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import App from './App.jsx';
import './index.css';

if (Capacitor.isNativePlatform()) {
  CapacitorUpdater.notifyAppReady();
}

const rootEl = document.getElementById('root');
const tree = (
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

if (rootEl.hasChildNodes()) {
  ReactDOM.hydrateRoot(rootEl, tree);
} else {
  ReactDOM.createRoot(rootEl).render(tree);
}

// Signal to prerender plugin (vite-plugin-prerender) that React has mounted.
if (typeof window !== 'undefined') {
  setTimeout(() => {
    document.dispatchEvent(new Event('render-event'));
  }, 1500);
}
