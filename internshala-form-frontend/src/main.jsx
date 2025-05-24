import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { FormProvider } from './context/FormContext.jsx'; 
import { AuthProvider } from './context/AuthContext.jsx'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> 
        <FormProvider>
          <App />
        </FormProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);