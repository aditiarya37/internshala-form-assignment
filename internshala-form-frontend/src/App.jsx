// src/App.jsx
import React from 'react'; // Added React import for completeness
import { Routes, Route, Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Page1 from './pages/Page1';
import Page2 from './pages/Page2';
import Page3 from './pages/Page3';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ApplicationsListPage from './pages/ApplicationsListPage';

// ProtectedRoute component
const ProtectedRoute = () => {
  const { isAuthenticated, loadingAuth } = useAuth();
  const location = useLocation();

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div>Checking authentication...</div> {/* Or a proper spinner */}
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect them to the /auth page, but save the current location they were
    // trying to go to in case they log in successfully.
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <Outlet />; // User is authenticated, render the child routes
};

function App() {
  const { isAuthenticated, loadingAuth } = useAuth();

  // Show a global loading indicator while initial auth status is being determined
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div>Loading Application...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Route: Authentication Page */}
      <Route 
        path="/auth" 
        element={isAuthenticated ? <Navigate to="/home" replace /> : <AuthPage />} 
      />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/applications" element={<ApplicationsListPage />} />
        <Route path="/apply/page1" element={<Page1 />} />
        <Route path="/apply/page2" element={<Page2 />} />
        <Route path="/apply/page3" element={<Page3 />} />
        
        {/* If user is authenticated and hits root, redirect to home */}
        <Route path="/" element={<Navigate to="/home" replace />} /> 
      </Route>

      {/* 
        Catch-all: If no routes above matched.
        If authenticated, show 404.
        If not authenticated, ProtectedRoute (if it wrapped this) would have already redirected to /auth.
        So, this primarily catches unauthenticated users trying to access non-existent paths or the root path.
      */}
      <Route 
        path="*" 
        element={
          isAuthenticated ? (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
              <h1 className="text-4xl sm:text-5xl font-bold text-indigo-600 mb-4">404</h1>
              <p className="text-slate-700 text-lg sm:text-xl mb-6 text-center">Oops! The page you're looking for doesn't exist.</p>
              <Link to="/home" className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-base font-medium">
                  Go to Homepage
              </Link>
            </div>
          ) : (
            // If not authenticated and no other route matched (e.g. trying a deep link), redirect to auth
            <Navigate to="/auth" replace />
          )
        } 
      />
    </Routes>
  );
}

export default App;