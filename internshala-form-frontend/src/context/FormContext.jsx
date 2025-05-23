// src/context/FormContext.jsx
import React, { createContext, useContext, useState } from 'react';

const initialFormData = {
  id: null, // For storing the backend ID of the application
  name: '',
  email: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  zipcode: '',
  isStudying: false, 
  studyingAt: '',
  projects: [],
};

const FormContext = createContext();

export function FormProvider({ children }) {
  const [formData, setFormData] = useState(initialFormData);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateFields = (fieldsToUpdate) => {
    setFormData(prev => ({ ...prev, ...fieldsToUpdate }));
  };

  const resetForm = () => setFormData(initialFormData);

  return (
    <FormContext.Provider value={{ formData, updateField, updateFields, resetForm }}>
      {children}
    </FormContext.Provider>
  );
}

export function useForm() {
  return useContext(FormContext);
}