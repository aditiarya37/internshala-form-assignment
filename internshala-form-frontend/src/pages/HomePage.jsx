import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../context/FormContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { FileText, LogOut, ListChecks, PlusCircle } from 'lucide-react';

export default function HomePage() {
  const { logout } = useAuth();
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

  const heroImageUrl = '/application-image.png';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-sky-100 flex flex-col">
      <header className="w-full shadow-sm bg-white/30 backdrop-blur-md sticky top-0 h-16 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Internshala Form</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-md"
            >
              <LogOut size={16} className="mr-1.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-stretch">
            <div className="space-y-6 text-center lg:text-left flex flex-col justify-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-800">
                Internshala <span className="text-indigo-600">Multi-Page Form</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0">
                A React & Node.js application demonstrating data persistence, validation, and user-friendly form navigation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div
                  className="transform hover:scale-105 transition-transform duration-300 cursor-pointer bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden h-full"
                  onClick={handleStartNewApplication}
                >
                  <div className="h-1.5 bg-indigo-500"></div>
                  <Card className="border-0 shadow-none rounded-none flex flex-col items-center justify-center p-6 text-center h-full">
                    <div className="p-4 bg-indigo-100 rounded-full mb-4">
                      <PlusCircle size={36} className="text-indigo-600" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-slate-800 mb-1">Submit New Application</CardTitle>
                    <CardDescription className="text-sm text-slate-500">
                      Fill out the multi-step form to submit your details.
                    </CardDescription>
                  </Card>
                </div>

                <Link to="/applications" className="block h-full">
                  <div className="transform hover:scale-105 transition-transform duration-300 cursor-pointer bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden h-full">
                    <div className="h-1.5 bg-teal-500"></div>
                    <Card className="border-0 shadow-none rounded-none flex flex-col items-center justify-center p-6 text-center h-full">
                      <div className="p-4 bg-teal-100 rounded-full mb-4">
                        <ListChecks size={36} className="text-teal-600" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-slate-800 mb-1">View Submissions</CardTitle>
                      <CardDescription className="text-sm text-slate-500">
                        Review and manage your previously submitted applications.
                      </CardDescription>
                    </Card>
                  </div>
                </Link>
              </div>
            </div>

            <div className="hidden lg:flex flex-col items-center justify-center p-0">
              <img
                src={heroImageUrl}
                alt="Multi-step form application"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
