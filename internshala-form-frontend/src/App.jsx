import React from 'react'; 
import { Routes, Route, Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Page1 from './pages/Page1';
import Page2 from './pages/Page2';
import Page3 from './pages/Page3';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ApplicationsListPage from './pages/ApplicationsListPage';

const ProtectedRoute = () => {
  const { isAuthenticated, loadingAuth } = useAuth();
  const location = useLocation();

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div>Checking authentication...</div> {}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <Outlet />; 
};

function App() {
  const { isAuthenticated, loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div>Loading Application...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={isAuthenticated ? <Navigate to="/home" replace /> : <AuthPage />} 
      />

      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/applications" element={<ApplicationsListPage />} />
        <Route path="/apply/page1" element={<Page1 />} />
        <Route path="/apply/page2" element={<Page2 />} />
        <Route path="/apply/page3" element={<Page3 />} />
        
        <Route path="/" element={<Navigate to="/home" replace />} /> 
      </Route>

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
            <Navigate to="/auth" replace />
          )
        } 
      />
    </Routes>
  );
}

export default App;