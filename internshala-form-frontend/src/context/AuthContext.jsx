import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null); 
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        setToken(storedToken);
        console.log("AuthContext: Token found in localStorage and set.");
      }
      setLoadingAuth(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('https://internshala-form.onrender.com/api/users/login', { email, password });
      if (response.data && response.data.token) {
        const newToken = response.data.token;
        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken);
        console.log("AuthContext: Login successful, token set:", newToken);
        return { success: true, token: newToken };
      }
      console.warn("AuthContext: Login response format unexpected or token missing. Response:", response.data);
      return { success: false, error: response.data?.message || "Login failed: Unexpected server response." };
    } catch (error) {
      console.error("AuthContext: Login API error:", error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || "Login API request failed." };
    }
  };

  const signup = async (email, password) => { 
    try {
      const payload = { email, password };
      const response = await axios.post('https://internshala-form.onrender.com/api/users/register', payload);
      if (response.data && response.data.token) {
        const newToken = response.data.token;
        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken);
        console.log("AuthContext: Signup successful, token set:", newToken);
        return { success: true, token: newToken };
      }
      console.warn("AuthContext: Signup response format unexpected or token missing. Response:", response.data);
      return { success: false, error: response.data?.message || "Signup failed: Unexpected server response." };
    } catch (error) {
      console.error("AuthContext: Signup API error:", error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || "Signup API request failed." };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
    console.log("AuthContext: User logged out.");
  };

  const isAuthenticated = !!token; 

  const value = {
    token, 
    isAuthenticated,
    login,
    signup,
    logout,
    loadingAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loadingAuth && children} 
    </AuthContext.Provider>
  );
};