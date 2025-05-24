import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FormLayout from "@/components/FormLayout";
import { useForm } from "../context/FormContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CheckCircle, PlusCircle, Trash2 } from 'lucide-react';

const LocalStepsConfig = [
  { id: 1, name: "Personal Info" },
  { id: 2, name: "Education" },
  { id: 3, name: "Projects" },
  { id: 4, name: "Confirmation" },
];

export default function Page3() {
  const { formData, updateField, updateFields, resetForm } = useForm();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);

  useEffect(() => {
    if (!Array.isArray(formData.projects) || formData.projects.length === 0) {
      updateField("projects", [{ name: "", description: "" }]);
    }
  }, [formData.projects, updateField]);

  function validate() {
    const newErrors = {};
    const projects = Array.isArray(formData.projects) ? formData.projects : [];
    const filledProjects = projects.filter(p => p.name?.trim() || p.description?.trim());

    if (filledProjects.length === 0 && projects.length > 0) {
      newErrors.projects = "Please fill in details for at least one project, or remove empty project entries.";
      projects.forEach((_proj, idx) => {
        if (!projects[idx].name?.trim() && !projects[idx].description?.trim()) {
          newErrors[`projects.${idx}.name`] = "Project title or description is required.";
        }
      });
    } else if (filledProjects.length === 0 && projects.length === 0) {
       newErrors.projects = "Please add at least one project.";
    } else {
      projects.forEach((proj, idx) => {
        if (proj.name?.trim() || proj.description?.trim()) {
          if (!proj.name || !proj.name.trim()) {
            newErrors[`projects.${idx}.name`] = "Project title is required.";
          }
          if (!proj.description || !proj.description.trim()) {
            newErrors[`projects.${idx}.description`] = "A brief description is required.";
          }
        }
      });
    }
    return newErrors;
  }

  const saveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const response = await axios.post("http://localhost:5000/api/applications", formData);
      if (response.data && response.data._id) {
        updateFields(response.data);
      }
      console.log("Draft saved successfully (from Page 3 Prev)", response.data);
    } catch (err) {
      console.error("Failed to save draft (from Page 3 Prev):", err);
      alert("Could not save draft. Please check your connection. Proceeding with navigation...");
    } finally {
      setIsSavingDraft(false);
    }
  };

  function handleAddProject() { 
    const currentProjects = Array.isArray(formData.projects) ? [...formData.projects] : [];
    updateField("projects", [
      ...currentProjects,
      { name: "", description: "" }
    ]);
  }
  function handleRemoveProject(idx) { 
    let currentProjects = Array.isArray(formData.projects) ? [...formData.projects] : [];
    currentProjects.splice(idx, 1);
    if (currentProjects.length === 0) {
      currentProjects = [{ name: "", description: "" }];
    }
    updateField("projects", currentProjects);
  }
  function handleProjectChange(idx, field, value) { 
    const currentProjects = Array.isArray(formData.projects) ? [...formData.projects] : [];
    while (currentProjects.length <= idx) {
        currentProjects.push({ name: "", description: "" });
    }
    const updatedProjects = currentProjects.map((p, i) => 
      i === idx ? { ...p, [field]: value } : p
    );
    updateField("projects", updatedProjects);
  }

  async function handlePrev(e) {
    e.preventDefault();
    await saveDraft();
    navigate("/apply/page2");
  }

  async function handleSubmit(e) { 
    e.preventDefault();
    setIsSubmittingFinal(true); 
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setIsSubmittingFinal(false);
      return;
    }

    const projectsToSubmit = (Array.isArray(formData.projects) ? formData.projects : [])
        .filter(p => p.name?.trim() || p.description?.trim());
    const payload = { ...formData, projects: projectsToSubmit }; 
    console.log("Submitting FINAL payload:", JSON.stringify(payload, null, 2));

    try {
      await axios.post("http://localhost:5000/api/applications", payload); 
      setSubmitSuccess(true);
    } catch (err) {
      console.error("Submission error full object:", err);
      let alertMessage = "Failed to submit application.";
      if (err.response) {
        console.error("Backend Response Data:", err.response.data);
        console.error("Backend Response Status:", err.response.status);
        alertMessage += ` Server responded with status ${err.response.status}.`;
        if (err.response.data && typeof err.response.data.message === 'string') {
            alertMessage += ` Message: ${err.response.data.message}`;
        } else if (err.response.data && typeof err.response.data === 'object') {
            try {
                const DtoString = JSON.stringify(err.response.data);
                if (DtoString.length < 200) alertMessage += ` Details: ${DtoString}`;
            } catch (e) {}
        }
      } else if (err.request) {
        console.error("No response received:", err.request);
        alertMessage = "No response from server. Please check if the server is running and reachable.";
      } else {
        console.error("Error setting up request:", err.message);
        alertMessage = "Error setting up the request. Please check your network or application setup.";
      }
      alert(alertMessage + " Check console for more details.");
    } finally {
      setIsSubmittingFinal(false);
    }
  }
  
  const inputBaseClass = `bg-white text-slate-900 border focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-full rounded-md placeholder:text-slate-400 py-2.5 px-3 text-sm`;
  const inputClass = (hasError) => `${inputBaseClass} ${hasError ? "border-red-400" : "border-slate-300"}`;
  const textareaClass = (hasError) => `${inputClass(hasError)} min-h-[100px] resize-y`;

  const anySavingInProgress = isSavingDraft || isSubmittingFinal;

  if (submitSuccess) {
    const confirmationStepId = LocalStepsConfig.find(s => s.name.toLowerCase() === "confirmation")?.id || 4;

    return (
      <FormLayout pageTitle="Application Submitted!" currentStep={confirmationStepId}>
        <div className="text-center py-2 sm:py-4 space-y-3 sm:space-y-4">
          <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-teal-500 mx-auto mb-2 sm:mb-3" strokeWidth={1.5} />
          <h2 className="text-2xl sm:text-3xl font-semibold text-teal-600">Thank You!</h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-md mx-auto">
            Your application has been successfully submitted. We appreciate your interest!
          </p>
          <p className="text-slate-500 text-xs sm:text-sm">
            We will review your details and get back to you if you are shortlisted.
          </p>
          <Button 
            onClick={() => {
              if(resetForm) resetForm();
              navigate("/");
            }}
            className="mt-6 sm:mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 sm:py-3 sm:px-8 rounded-md text-base"
          >
            Return to Homepage
          </Button>
        </div>
      </FormLayout>
    );
  }

  const projectsToRender = Array.isArray(formData.projects) && formData.projects.length > 0 
                           ? formData.projects 
                           : [{ name: "", description: "" }]; 

  return (
    <FormLayout pageTitle="Projects & Experience" currentStep={3}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.projects && !Object.keys(errors).some(k => k.startsWith("projects.")) && (
            <p className="text-red-500 text-xs mb-3 -mt-2">{errors.projects}</p>
        )}
        
        {projectsToRender.map((proj, idx) => (
          <div key={idx} className="border border-slate-200 rounded-lg p-4 sm:p-5 bg-slate-50/50 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-slate-700">Project #{idx + 1}</h3>
                { (projectsToRender.length > 1 || (projectsToRender.length === 1 && (proj.name?.trim() || proj.description?.trim()))) && (
                    <Button
                        type="button" variant="ghost" size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1"
                        onClick={() => handleRemoveProject(idx)} disabled={anySavingInProgress} >
                        <Trash2 size={16} className="mr-1.5" /> Remove
                    </Button>
                )}
            </div>
            <div>
              <Label htmlFor={`project-name-${idx}`} className="block text-sm font-medium text-slate-700 mb-1.5">Project Title*</Label>
              <Input id={`project-name-${idx}`} value={proj.name || ''} 
                onChange={e => handleProjectChange(idx, "name", e.target.value)}
                className={inputClass(errors[`projects.${idx}.name`])}
                placeholder="e.g., E-commerce Platform Redesign" disabled={anySavingInProgress}/>
              {errors[`projects.${idx}.name`] && (<p className="text-red-500 text-xs mt-1">{errors[`projects.${idx}.name`]}</p>)}
            </div>
            <div>
              <Label htmlFor={`project-desc-${idx}`} className="block text-sm font-medium text-slate-700 mb-1.5">Brief Description*</Label>
              <Textarea id={`project-desc-${idx}`} value={proj.description || ''} 
                onChange={e => handleProjectChange(idx, "description", e.target.value)}
                className={textareaClass(errors[`projects.${idx}.description`])}
                placeholder="Describe your project, your role, key achievements, and technologies used." disabled={anySavingInProgress}/>
              {errors[`projects.${idx}.description`] && (<p className="text-red-500 text-xs mt-1">{errors[`projects.${idx}.description`]}</p>)}
            </div>
          </div>
        ))}

        <Button type="button" onClick={handleAddProject} variant="outline"
          className="w-full border-indigo-500 text-indigo-600 hover:bg-indigo-50 font-medium py-2.5 rounded-md flex items-center justify-center gap-2"
          disabled={anySavingInProgress} >
          <PlusCircle size={18} /> Add Another Project
        </Button>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button type="button" onClick={handlePrev} 
            className="w-full sm:w-1/2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold py-3 rounded-md text-base"
            disabled={anySavingInProgress} >
            {isSavingDraft ? "Saving..." : "Previous"}
          </Button>
          <Button type="submit" 
            className="w-full sm:w-1/2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-md text-base"
            disabled={anySavingInProgress} >
            {isSubmittingFinal ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </FormLayout>
  );
}