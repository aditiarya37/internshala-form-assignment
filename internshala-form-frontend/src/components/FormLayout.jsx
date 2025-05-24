import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Check, UserCircle, Edit3, ListChecks, CheckCheck } from 'lucide-react'; 

const StepsConfig = [
  { id: 1, name: "Personal Info", icon: UserCircle }, 
  { id: 2, name: "Education", icon: Edit3 },
  { id: 3, name: "Projects", icon: ListChecks },
  { id: 4, name: "Confirmation", icon: CheckCheck },
];

const StepIndicator = ({ currentStep }) => {
  const completedIconSize = 20;

  return (
    <div className="flex w-full items-start mb-8 sm:mb-10 px-1">
      {StepsConfig.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        const IconComponent = isCompleted ? Check : step.icon;

        let iconSizeToShow;
        if (isCompleted) {
          iconSizeToShow = completedIconSize;
        } else if (isActive) {
          iconSizeToShow = step.icon === UserCircle ? 26 : 24;
        } else {
          iconSizeToShow = step.icon === UserCircle ? 24 : 22;
        }

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center flex-shrink-0 w-1/3 sm:w-auto">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 font-semibold text-lg
                  ${
                    isActive
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : isCompleted
                      ? "bg-teal-500 border-teal-400 text-white"
                      : "bg-slate-100 border-slate-300 text-slate-500"
                  }`}
              >
                <IconComponent size={iconSizeToShow} />
              </div>
              <p className={`mt-2 text-xs sm:text-sm text-center font-medium w-20 sm:w-24 truncate ${
                  isActive ? "text-indigo-600" :
                  isCompleted ? "text-teal-600" :
                  "text-slate-500"
              }`}>
                {step.name}
              </p>
            </div>
            {index < StepsConfig.length - 1 && (
              <div className={`flex-1 h-1 mt-5 sm:mt-6 ${index < StepsConfig.length -1 ? 'mx-1 sm:mx-2 md:mx-3' : ''} rounded-full ${
                  currentStep > step.id + 1 ? "bg-teal-500" : (currentStep === step.id + 1 ? "bg-indigo-500" : "bg-slate-300")
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default function FormLayout({ children, pageTitle, currentStep }) {
  const pageBackgroundClass = "bg-gradient-to-br from-slate-100 via-gray-100 to-sky-100";

  return (
    <div className={`${pageBackgroundClass} min-h-screen text-slate-800 py-8 sm:py-12 px-4 flex flex-col items-center justify-start sm:justify-center`}>
      <Card className="w-full max-w-2xl bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden py-0 sm:py-0"> 
        <div className="h-1.5 bg-indigo-500"></div>
        
        <div className="px-6 pt-6 pb-0 sm:px-8 sm:pt-8 sm:pb-0">
            <StepIndicator currentStep={currentStep} />
            
            <CardHeader className="p-0 mb-1 sm:mb-2">
              <CardTitle className="text-2xl sm:text-3xl font-semibold text-center text-slate-800">
                {pageTitle}
              </CardTitle>
            </CardHeader>
        </div>

        <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8 pt-0 sm:pt-1"> 
          {children}
        </CardContent>
      </Card>
    </div>
  );
}