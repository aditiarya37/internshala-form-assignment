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
  const { login, signup, isAuthenticated, loadingAuth } = useAuth(); 

  useEffect(() => {
    if (!loadingAuth && isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, loadingAuth, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    let authResult;
    if (isLoginView) {
      if (!email || !password) {
        setError("Email and password are required.");
        setLoading(false);
        return;
      }
      authResult = await login(email, password);
    } else { 
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
      authResult = await signup(email, password); 
    }
    setLoading(false);
    if (authResult && authResult.success) {
    } else if (authResult) {
      setError(authResult.error || 'Authentication failed. Please try again.');
    } else {
      setError('An unexpected error occurred during the authentication attempt.');
    }
  };

  const inputClass = (hasError = false) =>
    `bg-white text-slate-900 border ${
      hasError ? "border-red-400" : "border-slate-300"
    } focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-full rounded-md placeholder:text-slate-400 py-2.5 px-3 text-sm`;

  const pageTitle = isLoginView ? 'Welcome Back!' : 'Create Your Account';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-sky-100 text-slate-800 py-8 sm:py-12 px-4 flex flex-col items-center justify-center">
      <Card className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden py-0">
        <div className="h-1.5 bg-indigo-500"></div>
        
        <div className="px-6 pt-6 pb-2 sm:px-8 sm:pt-8 sm:pb-3">
          <div className="flex items-center justify-center mb-4">
            {isLoginView ? <LogIn size={28} className="text-indigo-600" /> : <UserPlus size={28} className="text-indigo-600" />}
          </div>
          <CardHeader className="p-0 mb-4 sm:mb-5">
            <CardTitle className="text-2xl sm:text-3xl font-semibold text-center text-slate-800">
              {pageTitle}
            </CardTitle>
          </CardHeader>
        </div>

        <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8 pt-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</Label>
              <Input
                id="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} 
                className={inputClass(error.toLowerCase().includes('email'))}
                placeholder="you@example.com" disabled={loading} required
              />
            </div>
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">Password</Label>
              <Input
                id="password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} 
                className={inputClass(error.toLowerCase().includes('password'))}
                placeholder="Enter your password" disabled={loading} required
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center pt-1">{error}</p>}
            <Button
              type="submit" 
              className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md text-base"
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
