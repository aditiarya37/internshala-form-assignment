// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // No currentUser state needed if not displaying user-specific info immediately
  // const [currentUser, setCurrentUser] = useState(null); 
  const [token, setToken] = useState(null); // Initialize to null
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        setToken(storedToken); // Assume token is valid if present for this simplified version
        // If you had a /profile endpoint, you could still verify it here,
        // but we are removing the need to set currentUser immediately.
        console.log("AuthContext: Token found in localStorage and set.");
      }
      setLoadingAuth(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', { email, password });
      // Now only expecting 'token' in the response for basic auth state
      if (response.data && response.data.token) {
        const newToken = response.data.token;
        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken);
        console.log("AuthContext: Login successful, token set:", newToken);
        return { success: true, token: newToken }; // Return token if needed by caller
      }
      console.warn("AuthContext: Login response format unexpected or token missing. Response:", response.data);
      return { success: false, error: response.data?.message || "Login failed: Unexpected server response." };
    } catch (error) {
      console.error("AuthContext: Login API error:", error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || "Login API request failed." };
    }
  };

  const signup = async (email, password) => { // Removed 'name' from parameters
    try {
      const payload = { email, password }; // No 'name' in payload
      const response = await axios.post('http://localhost:5000/api/users/register', payload);
      // Now only expecting 'token' in the response
      if (response.data && response.data.token) {
        const newToken = response.data.token;
        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken);
        console.log("AuthContext: Signup successful, token set:", newToken);
        return { success: true, token: newToken }; // Return token
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
    // setCurrentUser(null); // No currentUser to clear
    delete axios.defaults.headers.common['Authorization'];
    console.log("AuthContext: User logged out.");
  };

  // isAuthenticated is now solely based on the presence of a token
  const isAuthenticated = !!token; 

  const value = {
    // currentUser: null, // No longer exposing currentUser directly from here
    token, 
    isAuthenticated,
    login,
    signup,
    logout,
    loadingAuth,
    // You might add a function here later like 'fetchUserProfile' if needed elsewhere
  };

  return (
    <AuthContext.Provider value={value}>
      {!loadingAuth && children} 
    </AuthContext.Provider>
  );
};