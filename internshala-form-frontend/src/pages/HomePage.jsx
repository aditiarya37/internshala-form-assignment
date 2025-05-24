// src/pages/HomePage.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // useAuth will still be used for logout
import { useForm } from '../context/FormContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { FileText, LogOut, ListChecks, PlusCircle } from 'lucide-react';

export default function HomePage() {
  const { logout } = useAuth(); // Only need logout from useAuth here
  const { resetForm } = useForm(); 
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth'); 
  };

  const handleStartNewApplication = () => {
    resetForm(); 
    navigate('/apply/page1');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-sky-100 p-4 sm:p-8 flex flex-col">
      <header className="w-full max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-center py-4 ">
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">InternshipConnect</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Generic welcome message */}
            <span className="text-sm text-slate-600 hidden sm:inline">
              Welcome!
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-700 hover:text-indigo-600">
              <LogOut size={18} className="mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* ... rest of HomePage JSX (cards for Start New Application / View Applications) remains the same ... */}
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer bg-white rounded-xl border border-slate-200" onClick={handleStartNewApplication}>
            <CardHeader className="items-center p-6">
              <div className="p-3 bg-indigo-100 rounded-full mb-3">
                <PlusCircle size={32} className="text-indigo-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-slate-800">Start New Application</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 text-center">
              <CardDescription className="text-sm text-slate-500">
                Begin a new internship application by filling out our multi-step form.
              </CardDescription>
            </CardContent>
          </Card>

          <Link to="/applications" className="block">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer bg-white rounded-xl border border-slate-200 h-full flex flex-col">
              <CardHeader className="items-center p-6">
                <div className="p-3 bg-teal-100 rounded-full mb-3">
                  <ListChecks size={32} className="text-teal-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-800">View My Applications</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 text-center flex-grow flex flex-col justify-center">
                <CardDescription className="text-sm text-slate-500">
                  Track the status and review details of your past submissions.
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}