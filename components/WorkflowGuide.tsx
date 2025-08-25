'use client';

interface WorkflowGuideProps {
  currentStep: 'auth' | 'browse' | 'select' | 'process' | 'chat';
}

export default function WorkflowGuide({ currentStep }: WorkflowGuideProps) {
  // Define the steps first
  const steps = [
    {
      id: 'auth',
      title: 'Connect Google Drive',
      description: 'Authenticate with Google via OAuth2',
      icon: '🔐',
      status: 'pending'
    },
    {
      id: 'browse',
      title: 'Browse Files',
      description: 'View your Google Drive documents',
      icon: '📂',
      status: 'pending'
    },
    {
      id: 'select',
      title: 'Select Documents',
      description: 'Choose files to analyze',
      icon: '✅',
      status: 'pending'
    },
    {
      id: 'process',
      title: 'Process Files',
      description: 'Extract and index content',
      icon: '⚡',
      status: 'pending'
    },
    {
      id: 'chat',
      title: 'Ask Questions',
      description: 'Chat with your documents',
      icon: '💬',
      status: 'pending'
    }
  ];

  // Define the function after steps are created
  function getCurrentStepIndex() {
    return steps.findIndex(step => step.id === currentStep);
  }

  // Get the current step index
  const currentStepIndex = getCurrentStepIndex();
  
  // Now update the status for each step
  const updatedSteps = steps.map((step, index) => ({
    ...step,
    status: index < currentStepIndex 
      ? 'completed' 
      : index === currentStepIndex 
        ? 'current' 
        : 'pending'
  }));

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center mb-3">
        <span className="text-blue-600 text-lg mr-2">🗺️</span>
        <h3 className="text-sm font-medium text-blue-900">Google Drive Integration Workflow</h3>
      </div>
      
      <div className="flex items-center justify-between">
        {updatedSteps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.status === 'completed'
                    ? 'bg-green-500 text-white'
                    : step.status === 'current'
                    ? 'bg-blue-500 text-white ring-4 ring-blue-200'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.status === 'completed' ? '✓' : step.icon}
              </div>
              <div className="text-center mt-2">
                <div
                  className={`text-xs font-medium ${
                    step.status === 'current'
                      ? 'text-blue-600'
                      : step.status === 'completed'
                      ? 'text-green-600'
                      : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-xs text-gray-500 max-w-16">
                  {step.description}
                </div>
              </div>
            </div>
            
            {index < updatedSteps.length - 1 && (
              <div
                className={`h-0.5 w-12 mx-2 ${
                  getCurrentStepIndex() > index ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
