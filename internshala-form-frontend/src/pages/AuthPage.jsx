// src/pages/AuthPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, UserPlus } from 'lucide-react';

export default function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // We no longer need currentUser directly from useAuth here for navigation logic
  const { login, signup, isAuthenticated, loadingAuth } = useAuth(); 

  useEffect(() => {
    // Navigate if authentication state becomes true AND initial auth loading is complete
    if (!loadingAuth && isAuthenticated) {
      console.log("AuthPage useEffect: isAuthenticated is true, navigating to /home. IsAuth:", isAuthenticated);
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, loadingAuth, navigate]); // Removed currentUser from dependencies

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let authResult;
    if (isLoginView) {
      // ... (validation for login)
      if (!email || !password) {
        setError("Email and password are required.");
        setLoading(false);
        return;
      }
      authResult = await login(email, password);
    } else { // Signup view
      // ... (validation for signup)
      if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
        setError("Please enter a valid email address.");
        setLoading(false);
        return;
      }
      if (password.length < 6) { 
        setError("Password must be at least 6 characters long.");
        setLoading(false);
        return;
      }
      // Calling signup without name, as AuthContext's signup was simplified
      authResult = await signup(email, password); 
    }
    
    setLoading(false);

    if (authResult && authResult.success) { // No longer checking for authResult.user
      console.log("AuthPage handleSubmit: Auth action successful.");
      // Navigation is handled by the useEffect hook
    } else if (authResult) {
      setError(authResult.error || 'Authentication failed. Please try again.');
    } else {
      setError('An unexpected error occurred during the authentication attempt.');
    }
  };

  // ... (inputClass and JSX for the form remains the same - name input already removed) ...
  const inputClass = (hasError = false) =>
    `bg-white text-slate-900 border ${
      hasError ? "border-red-400" : "border-slate-300"
    } focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-full rounded-md placeholder:text-slate-400 py-2.5 px-3 text-sm`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-sky-100 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-xl rounded-xl">
        <CardHeader className="p-6 sm:p-8 items-center border-b border-slate-200">
            <div className="flex items-center justify-center mb-4">
                {isLoginView ? <LogIn size={32} className="text-indigo-600" /> : <UserPlus size={32} className="text-indigo-600" />}
            </div>
          <CardTitle className="text-2xl sm:text-3xl font-semibold text-center text-slate-800">
            {isLoginView ? 'Welcome Back!' : 'Create Account'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name input is already removed */}
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</Label>
              <Input
                id="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} className={inputClass(error.toLowerCase().includes('email'))}
                placeholder="you@example.com" disabled={loading} required
              />
            </div>
            <div>
              <Label htmlFor="password"className="block text-sm font-medium text-slate-700 mb-1.5">Password</Label>
              <Input
                id="password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} className={inputClass(error.toLowerCase().includes('password'))}
                placeholder="Enter your password" disabled={loading} required
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button
              type="submit" className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md text-base"
              disabled={loading} >
              {loading ? (isLoginView ? 'Logging in...' : 'Signing up...') : (isLoginView ? 'Login' : 'Sign Up')}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLoginView(!isLoginView); setError(''); setEmail(''); setPassword('');
              }}
              className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline" >
              {isLoginView ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}