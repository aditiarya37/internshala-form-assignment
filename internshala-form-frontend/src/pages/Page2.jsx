import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import FormLayout from "@/components/FormLayout";
import { useForm } from "../context/FormContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Page2() {
  const { formData, updateField, updateFields } = useForm();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  function validate() {
    const newErrors = {};
    if (formData.isStudying === undefined || formData.isStudying === null) {
      newErrors.isStudying = "Please select your current study status.";
    }
    if (formData.isStudying === true && (!formData.studyingAt || !formData.studyingAt.trim())) {
      newErrors.studyingAt = "Please specify where you are studying.";
    }
    return newErrors;
  }

  const saveDraft = async () => {
    setIsSaving(true);
    try {
      const response = await axios.post("https://internshala-form.onrender.com/api/applications", formData);
      if (response.data && response.data._id) {
        updateFields(response.data);
      }
      console.log("Draft saved successfully", response.data);
    } catch (err) {
      console.error("Failed to save draft:", err);
      alert("Could not save draft. Please check your connection. Proceeding with navigation...");
    } finally {
      setIsSaving(false);
    }
  };

  async function handleNext(e) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    await saveDraft();
    navigate("/apply/page3");
  }

  async function handlePrev(e) {
    e.preventDefault();
    await saveDraft();
    navigate("/apply/page1");
  }
  
  const inputClass = (field) =>
    `bg-white text-slate-900 border ${
      errors[field] ? "border-red-400" : "border-slate-300"
    } focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-full rounded-md placeholder:text-slate-400 py-2.5 px-3 text-sm`;

  return (
    <FormLayout pageTitle="Educational Background" currentStep={2}>
      <form onSubmit={handleNext} className="space-y-6">
        <div>
          <Label className="block text-sm font-medium text-slate-700 mb-2">Are you currently enrolled in studies?*</Label>
          <RadioGroup
            value={formData.isStudying === true ? "yes" : formData.isStudying === false ? "no" : ""}
            onValueChange={val => updateField("isStudying", val === "yes")}
            className="flex gap-x-6 gap-y-2 items-center flex-wrap"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="studying-yes" className="text-indigo-600 border-slate-400 focus:ring-indigo-500 data-[state=checked]:border-indigo-600" disabled={isSaving}/>
              <Label htmlFor="studying-yes" className="text-slate-700 font-normal cursor-pointer">Yes, I am currently studying</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="studying-no" className="text-indigo-600 border-slate-400 focus:ring-indigo-500 data-[state=checked]:border-indigo-600" disabled={isSaving}/>
              <Label htmlFor="studying-no" className="text-slate-700 font-normal cursor-pointer">No, I have completed my studies / am not studying</Label>
            </div>
          </RadioGroup>
          {errors.isStudying && <p className="text-red-500 text-xs mt-1">{errors.isStudying}</p>}
        </div>

        {formData.isStudying === true && (
          <div className="pt-2">
            <Label htmlFor="studyingAt" className="block text-sm font-medium text-slate-700 mb-1.5">Name of Institution*</Label>
            <Input
              id="studyingAt"
              value={formData.studyingAt || ''}
              onChange={e => updateField("studyingAt", e.target.value)}
              className={inputClass("studyingAt")}
              placeholder="e.g., University of Advanced Studies"
              disabled={isSaving}
            />
            {errors.studyingAt && <p className="text-red-500 text-xs mt-1">{errors.studyingAt}</p>}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            type="button" 
            onClick={handlePrev} 
            className="w-full sm:w-1/2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold py-3 rounded-md text-base"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Previous"}
          </Button>
          <Button 
            type="submit" 
            className="w-full sm:w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md text-base"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Next: Projects"}
          </Button>
        </div>
      </form>
    </FormLayout>
  );
}