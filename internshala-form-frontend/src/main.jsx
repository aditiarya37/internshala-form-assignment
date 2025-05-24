// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Your global styles
import { BrowserRouter } from 'react-router-dom';
import { FormProvider } from './context/FormContext.jsx'; // Adjust path
import { AuthProvider } from './context/AuthContext.jsx'; // Adjust path

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* AuthProvider wraps FormProvider and App */}
        <FormProvider> {/* FormProvider wraps App */}
          <App />
        </FormProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);