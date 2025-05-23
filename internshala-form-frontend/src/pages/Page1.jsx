// src/pages/Page1.jsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import FormLayout from "@/components/FormLayout";
import { useForm } from "../context/FormContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Ensure axios is imported

export default function Page1() {
  const { formData, updateField, updateFields } = useForm(); // Added updateFields
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false); // For loading state

  function validate() {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.match(/^[^@]+@[^@]+\.[^@]+$/)) newErrors.email = "Valid email is required";
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = "Address Line 1 is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.zipcode.match(/^\d{5,6}$/)) newErrors.zipcode = "Valid zipcode is required (5 or 6 digits)";
    return newErrors;
  }

  const saveDraft = async () => {
    setIsSaving(true);
    try {
      // Send all formData, backend will use _id if present to update, or create if _id is null
      const response = await axios.post("http://localhost:5000/api/applications", formData);
      if (response.data && response.data._id) {
        // Update context with the potentially new _id and any other data returned by backend
        updateFields(response.data); 
      }
      console.log("Draft saved successfully", response.data);
    } catch (err) {
      console.error("Failed to save draft:", err);
      // Optionally, show a non-blocking error to the user (e.g., a toast notification)
      // For now, we'll let navigation proceed even if draft save fails to avoid blocking user
      // You might want to make this more robust based on requirements
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

    await saveDraft(); // Save draft before navigating
    navigate("/page2");
  }

  const inputClass = (field) =>
    `bg-white text-slate-900 border ${
      errors[field] ? "border-red-400" : "border-slate-300"
    } focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-full rounded-md placeholder:text-slate-400 py-2.5 px-3 text-sm`;

  return (
    <FormLayout pageTitle="Your Personal Details" currentStep={1}>
      <form onSubmit={handleNext} className="space-y-5">
        <div>
          <Label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">Full Name*</Label>
          <Input id="name" value={formData.name} onChange={e => updateField("name", e.target.value)} className={inputClass("name")} placeholder="e.g., Jane Doe" disabled={isSaving} />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <Label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email Address*</Label>
          <Input id="email" type="email" value={formData.email} onChange={e => updateField("email", e.target.value)} className={inputClass("email")} placeholder="you@example.com" disabled={isSaving}/>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <Label htmlFor="addressLine1" className="block text-sm font-medium text-slate-700 mb-1.5">Street Address*</Label>
          <Input id="addressLine1" value={formData.addressLine1} onChange={e => updateField("addressLine1", e.target.value)} className={inputClass("addressLine1")} placeholder="123 Main Street" disabled={isSaving}/>
          {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>}
        </div>
        <div>
          <Label htmlFor="addressLine2" className="block text-sm font-medium text-slate-700 mb-1.5">Apartment, suite, etc. (Optional)</Label>
          <Input id="addressLine2" value={formData.addressLine2} onChange={e => updateField("addressLine2", e.target.value)} className={inputClass("addressLine2")} placeholder="Apt #1B" disabled={isSaving}/>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1.5">City*</Label>
            <Input id="city" value={formData.city} onChange={e => updateField("city", e.target.value)} className={inputClass("city")} placeholder="New York" disabled={isSaving}/>
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>
          <div>
            <Label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-1.5">State / Province*</Label>
            <Input id="state" value={formData.state} onChange={e => updateField("state", e.target.value)} className={inputClass("state")} placeholder="NY" disabled={isSaving}/>
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>
          <div>
            <Label htmlFor="zipcode" className="block text-sm font-medium text-slate-700 mb-1.5">Zip / Postal Code*</Label>
            <Input id="zipcode" value={formData.zipcode} onChange={e => updateField("zipcode", e.target.value)} className={inputClass("zipcode")} placeholder="10001" disabled={isSaving}/>
            {errors.zipcode && <p className="text-red-500 text-xs mt-1">{errors.zipcode}</p>}
          </div>
        </div>
        <Button 
          type="submit" 
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md text-base"
          disabled={isSaving} // Disable button while saving
        >
          {isSaving ? "Saving..." : "Next: Education"}
        </Button>
      </form>
    </FormLayout>
  );
}