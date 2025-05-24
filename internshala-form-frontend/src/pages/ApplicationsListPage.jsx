// src/pages/ApplicationsListPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../context/FormContext'; // Import useForm
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { FileText, ArrowLeft, Edit, Trash2, RefreshCw, ServerCrash, ChevronDown, ChevronUp, PlusCircle } from 'lucide-react';

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return 'Invalid Date';
  }
};

// Helper function to format date and time
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error("Error formatting date/time:", dateString, error);
    return 'Invalid Date/Time';
  }
};

export default function ApplicationsListPage() {
  const { logout } = useAuth(); // currentUser might not be directly needed if backend filters
  const { updateFields: updateFormContextFields } = useForm(); // Get updateFields
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true); // General page loading
  const [error, setError] = useState(null);
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // Stores appId of item being actioned upon or true for general action

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:5000/api/applications');
        setApplications(response.data);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
        let errorMessage = "Could not load applications. Please try again.";
        if (err.response) {
          errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
          if (err.response.status === 401 || err.response.status === 403) {
            // Optional: Consider logging out user if token is invalid/expired
            // logout();
            // navigate('/auth');
          }
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
  }, [navigate, logout]); // navigate and logout as dependencies for useEffect

  const toggleExpandApplication = (appId) => {
    if (actionLoading) return; // Prevent toggling while another action is in progress
    setExpandedAppId(expandedAppId === appId ? null : appId);
  };
  
  const handleEditApplication = async (appId) => {
    if (actionLoading) return; // Prevent multiple actions
    setActionLoading(appId); 
    setError(null); // Clear previous errors
    try {
      const response = await axios.get(`http://localhost:5000/api/applications/${appId}`);
      if (response.data) {
        // Ensure the data structure for projects is what FormContext expects (array of objects)
        const appDataForForm = { 
          ...response.data,
          projects: Array.isArray(response.data.projects) ? response.data.projects : [] 
        };
         // If your FormContext uses 'id' but backend gives '_id' for the application itself
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
      console.error(`Failed to fetch application ${appId} for editing:`, editError);
      setError(editError.response?.data?.message || `Could not load application ${appId} for editing.`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteApplication = async (appId) => {
    if (actionLoading) return; // Prevent multiple actions
    if (window.confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
      setActionLoading(appId);
      setError(null); // Clear previous errors
      try {
        await axios.delete(`http://localhost:5000/api/applications/${appId}`);
        setApplications(prev => prev.filter(app => app.id !== appId));
        console.log(`Application ${appId} deleted successfully from backend.`);
        if (expandedAppId === appId) setExpandedAppId(null);
      } catch (delError) {
        console.error("Failed to delete application:", delError);
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
      <ul className="space-y-2 list-disc list-inside pl-1">
        {projects.map((proj, index) => (
          <li key={index} className="text-sm">
            <strong className="font-medium text-slate-700">{proj.name || "Unnamed Project"}:</strong>
            <p className="text-slate-600 whitespace-pre-line ml-4">{proj.description || "No description."}</p>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-sky-100 p-4 sm:p-8">
      <header className="w-full max-w-5xl mx-auto mb-6 sm:mb-8">
        <div className="flex justify-between items-center py-4">
            <Button variant="outline" onClick={() => navigate('/home')} className="border-slate-300 text-slate-700 hover:bg-slate-100">
                <ArrowLeft size={18} className="mr-2" /> Back to Home
            </Button>
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">My Applications</h1>
          </div>
          <div></div> 
        </div>
      </header>

      <main className="w-full max-w-5xl mx-auto">
        {loading && !actionLoading && ( 
          <div className="flex flex-col items-center justify-center text-center py-10">
            <RefreshCw size={32} className="text-indigo-600 animate-spin mb-3" />
            <p className="text-slate-600">Loading your applications...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded-md shadow text-center">
            <ServerCrash size={24} className="mx-auto mb-2" />
            <p className="font-semibold">Oops! Something went wrong.</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        {!loading && !error && applications.length === 0 && (
          <div className="text-center py-10">
            <img src="/placeholder-no-apps.svg" alt="No applications found" className="mx-auto mb-4 w-40 h-40 opacity-70" /> 
            <p className="text-xl text-slate-600 mb-2">No applications found.</p>
            <p className="text-sm text-slate-500 mb-6">It looks like you haven't submitted any applications yet.</p>
            <Button onClick={() => navigate('/apply/page1')} className="bg-indigo-600 hover:bg-indigo-700">
              <PlusCircle size={18} className="mr-2" /> Start Your First Application
            </Button>
          </div>
        )}
        {!loading && !error && applications.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            {applications.map((app) => (
              <Card key={app.id} className={`bg-white shadow-md rounded-lg overflow-hidden border border-slate-200 transition-opacity duration-300 ${actionLoading === app.id ? 'opacity-60 pointer-events-none' : ''}`}>
                <CardHeader 
                  className="p-4 sm:p-5 border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleExpandApplication(app.id)}
                >
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex-grow">
                        <CardTitle className="text-lg sm:text-xl font-semibold text-slate-800 leading-tight">
                            {app.name || `Application - ${formatDate(app.createdAt)}`}
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500 mt-1">
                            ID: {app.id} 
                            {/* Removed status from here */}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700" aria-label={expandedAppId === app.id ? 'Hide details' : 'View details'}>
                        <span>{expandedAppId === app.id ? 'Hide' : 'View'} Details</span>
                        {expandedAppId === app.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </CardHeader>

                {expandedAppId === app.id && (
                  <CardContent className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-1">Personal Information:</h4>
                        <p className="text-sm text-slate-600"><strong>Name:</strong> {app.name || 'N/A'}</p>
                        <p className="text-sm text-slate-600"><strong>Email:</strong> {app.email || 'N/A'}</p>
                        <p className="text-sm text-slate-600"><strong>Address:</strong> {app.addressLine1 || ''}{app.addressLine2 ? `, ${app.addressLine2}` : ''}, {app.city || ''}, {app.state || ''} - {app.zipcode || ''}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-1">Educational Status:</h4>
                        <p className="text-sm text-slate-600">
                          <strong>Currently Studying:</strong> {typeof app.isStudying === 'boolean' ? (app.isStudying ? 'Yes' : 'No') : 'N/A'}
                        </p>
                        {app.isStudying && app.studyingAt && (
                          <p className="text-sm text-slate-600"><strong>Institution:</strong> {app.studyingAt}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <h4 className="text-sm font-semibold text-slate-700 mb-1">Projects:</h4>
                        {renderProjectDetails(app.projects)}
                      </div>
                       <div className="md:col-span-2 pt-2 border-t border-slate-200 mt-2">
                            <p className="text-xs text-slate-500"><strong>Submitted:</strong> {formatDateTime(app.createdAt)}</p>
                            <p className="text-xs text-slate-500"><strong>Last Update:</strong> {formatDateTime(app.updatedAt)}</p>
                       </div>
                    </div>
                  </CardContent>
                )}

                <CardFooter className="p-4 sm:p-5 bg-slate-50/70 border-t border-slate-200 flex justify-end gap-2 sm:gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditApplication(app.id)} 
                    className="text-xs sm:text-sm border-indigo-300 text-indigo-600 hover:bg-indigo-50 flex items-center"
                    disabled={!!actionLoading} // Disable if any action is loading
                  >
                    {actionLoading === app.id ? <RefreshCw size={14} className="mr-1.5 animate-spin" /> : <Edit size={14} className="mr-1.5" />}
                     Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDeleteApplication(app.id)} 
                    className="text-xs sm:text-sm bg-red-500 hover:bg-red-600 flex items-center"
                    disabled={!!actionLoading} // Disable if any action is loading
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