import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../context/FormContext';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { FileText, ArrowLeft, Edit, Trash2, RefreshCw, ServerCrash, ChevronDown, ChevronUp, PlusCircle } from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch {
    return 'Invalid Date';
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch {
    return 'Invalid Date/Time';
  }
};

export default function ApplicationsListPage() {
  const { logout } = useAuth();
  const { updateFields: updateFormContextFields } = useForm();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('https://internshala-form.onrender.com/api/applications');
        setApplications(response.data);
      } catch (err) {
        let errorMessage = "Could not load applications. Please try again.";
        if (err.response) {
          errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
        } else if (err.request) {
          errorMessage = "No response from server. Is it running?";
        } else {
          errorMessage = err.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [navigate, logout]);

  const toggleExpandApplication = (appId) => {
    if (actionLoading) return;
    setExpandedAppId(expandedAppId === appId ? null : appId);
  };

  const handleEditApplication = async (appId) => {
    if (actionLoading) return;
    setActionLoading(appId);
    setError(null);
    try {
      const response = await axios.get(`https://internshala-form.onrender.com/api/applications/${appId}`);
      if (response.data) {
        const appDataForForm = {
          ...response.data,
          projects: Array.isArray(response.data.projects) ? response.data.projects : []
        };
        if (appDataForForm._id && !appDataForForm.id) {
          appDataForForm.id = appDataForForm._id;
          delete appDataForForm._id;
        }
        updateFormContextFields(appDataForForm);
        navigate('/apply/page1');
      } else {
        throw new Error("Application data not found for editing.");
      }
    } catch (editError) {
      setError(editError.response?.data?.message || `Could not load application ${appId} for editing.`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteApplication = async (appId) => {
    if (actionLoading) return;
    if (window.confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
      setActionLoading(appId);
      setError(null);
      try {
        await axios.delete(`https://internshala-form.onrender.com/api/applications/${appId}`);
        setApplications(prev => prev.filter(app => app.id !== appId));
        if (expandedAppId === appId) setExpandedAppId(null);
      } catch (delError) {
        setError(delError.response?.data?.message || "Could not delete application.");
      } finally {
        setActionLoading(null);
      }
    }
  };

  const renderProjectDetails = (projects) => {
    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      return <p className="text-sm text-slate-500 italic">No project details submitted.</p>;
    }
    return (
      <ul className="space-y-3 list-disc list-inside pl-1">
        {projects.map((proj, index) => (
          <li key={index} className="text-sm">
            <strong className="font-medium text-slate-700">{proj.name || "Unnamed Project"}</strong>
            <p className="text-slate-600 whitespace-pre-line ml-5 mt-0.5">{proj.description || "No description."}</p>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-sky-100 p-4 sm:p-8">
      <header className="w-full max-w-5xl mx-auto mb-8 sm:mb-10">
        <div className="flex justify-between items-center py-4">
          <Button
            variant="outline"
            onClick={() => navigate('/home')}
            className="font-medium text-sm py-2 px-4 rounded-lg text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-1 focus-visible:ring-indigo-400 focus-visible:ring-offset-1"
          >
            <ArrowLeft size={16} className="mr-2" /> Back to Home
          </Button>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <FileText className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">My Applications</h1>
          </div>
          <div style={{ width: '150px' }}></div>
        </div>
      </header>

      <main className="w-full max-w-5xl mx-auto">
        {loading && !actionLoading && (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <RefreshCw size={40} className="text-indigo-500 animate-spin mb-4" />
            <p className="text-lg font-medium text-slate-700">Loading your applications...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-100/50 border-l-4 border-red-500 text-red-700 p-5 my-6 rounded-lg shadow-md text-center max-w-2xl mx-auto">
            <ServerCrash size={28} className="mx-auto mb-3 text-red-600" />
            <p className="font-semibold text-lg text-red-800">Oops! Something went wrong.</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}
        {!loading && !error && applications.length === 0 && (
          <div className="relative text-center py-16 bg-white shadow-xl rounded-xl p-8 sm:p-12 overflow-hidden">
            <div className="absolute top-0 left-0 h-1.5 bg-indigo-600 w-full"></div>
            <p className="text-2xl font-semibold text-slate-700 mb-3">No applications found.</p>
            <p className="text-base text-slate-500 mb-8">It looks like you haven't submitted any applications yet.</p>
            <Button
              onClick={() => navigate('/apply/page1')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 sm:py-3 sm:px-6 rounded-lg text-sm sm:text-base"
            >
              <PlusCircle size={20} className="mr-2" /> Start Your First Application
            </Button>
          </div>
        )}
        {!loading && !error && applications.length > 0 && (
          <div className="space-y-6 sm:space-y-8">
            {applications.map((app) => (
              <Card
                key={app.id}
                className={`bg-white shadow-lg rounded-xl overflow-hidden border border-slate-200/80 transition-all duration-300 ease-in-out relative ${actionLoading === app.id ? 'opacity-60 scale-95 pointer-events-none' : 'hover:shadow-xl'}`}
              >
                <div className="absolute top-0 left-0 h-1.5 bg-indigo-600 w-full"></div>
                <CardHeader
                  className="p-5 sm:p-6 border-b border-slate-200 cursor-pointer hover:bg-slate-50/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:ring-offset-white"
                  onClick={() => toggleExpandApplication(app.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleExpandApplication(app.id); }}
                  tabIndex={0}
                  role="button"
                  aria-expanded={expandedAppId === app.id}
                  aria-controls={`app-details-${app.id}`}
                >
                  <div className="flex justify-between items-center gap-3 sm:gap-4">
                    <div className="flex-grow">
                      <CardTitle className="text-lg sm:text-xl font-semibold text-slate-800 leading-tight">
                        {app.name || `Application - ${formatDate(app.createdAt)}`}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-slate-500 mt-1.5">
                        ID: {app.id}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium" aria-hidden="true">
                      <span>{expandedAppId === app.id ? 'Hide' : 'View'} Details</span>
                      {expandedAppId === app.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </CardHeader>

                {expandedAppId === app.id && (
                  <CardContent id={`app-details-${app.id}`} className="p-5 sm:p-6 border-t border-slate-200 bg-slate-50/40">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-1.5">Personal Information:</h4>
                        <p className="text-sm text-slate-600"><strong>Name:</strong> {app.name || 'N/A'}</p>
                        <p className="text-sm text-slate-600"><strong>Email:</strong> {app.email || 'N/A'}</p>
                        <p className="text-sm text-slate-600"><strong>Address:</strong> {`${app.addressLine1 || ''}${app.addressLine2 ? `, ${app.addressLine2}` : ''}, ${app.city || ''}, ${app.state || ''} - ${app.zipcode || ''}`.replace(/^, |, $/g, '') || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-1.5">Educational Status:</h4>
                        <p className="text-sm text-slate-600">
                          <strong>Currently Studying:</strong> {typeof app.isStudying === 'boolean' ? (app.isStudying ? 'Yes' : 'No') : 'N/A'}
                        </p>
                        {app.isStudying && (
                          <p className="text-sm text-slate-600"><strong>Institution:</strong> {app.studyingAt || 'N/A'}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <h4 className="text-sm font-semibold text-slate-700 mb-1.5">Projects:</h4>
                        {renderProjectDetails(app.projects)}
                      </div>
                      <div className="md:col-span-2 pt-3 border-t border-slate-200/80 mt-3">
                        <p className="text-xs text-slate-500"><strong>Submitted:</strong> {formatDateTime(app.createdAt)}</p>
                        <p className="text-xs text-slate-500"><strong>Last Update:</strong> {formatDateTime(app.updatedAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                )}

                <CardFooter className="p-5 sm:p-6 bg-slate-50/60 border-t border-slate-200/80 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditApplication(app.id)}
                    className="text-xs sm:text-sm font-medium border-indigo-500 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-600 focus-visible:ring-indigo-400"
                    disabled={!!actionLoading}
                  >
                    {actionLoading === app.id ? <RefreshCw size={14} className="mr-1.5 animate-spin" /> : <Edit size={14} className="mr-1.5" />}
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteApplication(app.id)}
                    className="text-xs sm:text-sm font-medium bg-red-600 hover:bg-red-700 focus-visible:ring-red-400"
                    disabled={!!actionLoading}
                  >
                    {actionLoading === app.id ? <RefreshCw size={14} className="mr-1.5 animate-spin" /> : <Trash2 size={14} className="mr-1.5" />}
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
