import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0f172a',
              color: '#ffffff',
              borderRadius: '12px',
              fontSize: '12px'
            }
          }}
        />
      </AdminAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
