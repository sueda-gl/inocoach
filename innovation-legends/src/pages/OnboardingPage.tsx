import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessProfile } from '../hooks/useBusinessProfile';
import { BusinessProfile } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';

// Import the new chat-based components
import ChatBasedProfileStep from '../components/business/ChatBasedProfileStep';
import ChatBasedChallengesGoalsStep from '../components/business/ChatBasedChallengesGoalsStep';
import DocumentUploadStep from '../components/business/DocumentUploadStep';
import InnovationReadinessStep from '../components/business/InnovationReadinessStep';
import InnovationPersonaStep from '../components/business/InnovationPersonaStep';
import OnboardingCompletionStep from '../components/business/OnboardingCompletionStep';

// Reuse the OnboardingLayout component
const OnboardingLayout = ({ children, currentStep, totalSteps }: { children: React.ReactNode, currentStep: number, totalSteps: number }) => (
  <div className="min-h-screen bg-deep-space flex flex-col items-center justify-center p-4">
    <div className="w-full max-w-4xl card">
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-ghost-gray">Step {currentStep} of {totalSteps}</span>
          <span className="text-ghost-gray">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-cosmic-slate h-2 rounded-full">
          <div 
            className="bg-electric-blue h-2 rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>
      {children}
    </div>
  </div>
);

// Initial business profile structure with default DNA segments
const initialBusinessDNASegments = [
  {
    id: uuidv4(),
    name: 'Innovation Culture',
    category: 'innovation',
    strength: 18,
    description: 'How well your organization embraces and supports new ideas',
    insights: ['Initial assessment based on your responses']
  },
  {
    id: uuidv4(),
    name: 'Financial Resources',
    category: 'finance',
    strength: 70,
    description: 'Available capital and financial flexibility for innovation',
    insights: ['Initial assessment based on your responses']
  },
  {
    id: uuidv4(),
    name: 'Market Awareness',
    category: 'marketing',
    strength: 40,
    description: 'Understanding of customer needs and market trends',
    insights: ['Initial assessment based on your responses']
  },
  {
    id: uuidv4(),
    name: 'Operational Efficiency',
    category: 'operations',
    strength: 45,
    description: 'Ability to implement and scale new initiatives',
    insights: ['Initial assessment based on your responses']
  }
] as any[];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { updateBusinessProfile } = useBusinessProfile();
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<Partial<BusinessProfile>>({
    id: uuidv4(),
    name: '',
    industry: '',
    size: '',
    founded: new Date().getFullYear(),
    challenges: [],
    goals: [],
    innovationReadiness: 50,
    dnaSegments: initialBusinessDNASegments
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const totalSteps = 6;
  
  // For debugging - log profile changes
  useEffect(() => {
    console.log('Current profile state:', profile);
  }, [profile]);
  
  const updateProfile = (updates: Partial<BusinessProfile>) => {
    console.log('Updating profile with:', updates);
    setProfile(prev => {
      const newProfile = { ...prev, ...updates };
      console.log('New profile state:', newProfile);
      return newProfile;
    });
  };
  
  const handleNextStep = () => {
    console.log('Next step clicked, current step:', currentStep);
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handlePreviousStep = () => {
    console.log('Previous step clicked, current step:', currentStep);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      // Ensure the profile is complete with required fields
      const completeProfile = {
        ...profile,
        // Make sure required fields have proper values, not empty strings
        name: profile.name && profile.name.trim() !== '' ? profile.name : 'My Business',
        industry: profile.industry && profile.industry.trim() !== '' ? profile.industry : 'Other',
        size: profile.size && profile.size.trim() !== '' ? profile.size : '1-10',
        founded: profile.founded || new Date().getFullYear(),
        // Add any missing default values for optional fields
        challenges: profile.challenges || [],
        goals: profile.goals || [],
        innovationReadiness: profile.innovationReadiness || 50,
        dnaSegments: profile.dnaSegments || initialBusinessDNASegments
      };
      
      console.log('Saving complete profile:', completeProfile);
      
      // Update the business profile in context and wait for it to complete
      await updateBusinessProfile(completeProfile as BusinessProfile);
      
      // Now that the update is complete, navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      // Reset submission state in case of error
      setIsSubmitting(false);
    }
  };
  
  const renderStep = () => {
    console.log('Rendering step:', currentStep);
    switch (currentStep) {
      case 1:
        return (
          <ChatBasedProfileStep
            businessProfile={profile}
            onUpdate={updateProfile}
            onNext={handleNextStep}
          />
        );
      case 2:
        return (
          <ChatBasedChallengesGoalsStep
            businessProfile={profile}
            onUpdate={updateProfile}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 3:
        return (
          <DocumentUploadStep
            businessProfile={profile}
            onUpdate={updateProfile}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 4:
        return (
          <InnovationReadinessStep
            readiness={profile.innovationReadiness || 50}
            onUpdate={(innovationReadiness: number) => updateProfile({ innovationReadiness })}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 5:
        return (
          <InnovationPersonaStep
            businessProfile={profile}
            onUpdate={updateProfile}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 6:
        return (
          <OnboardingCompletionStep
            profile={profile}
            onComplete={handleComplete}
            onBack={handlePreviousStep}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <OnboardingLayout currentStep={currentStep} totalSteps={totalSteps}>
      {renderStep()}
    </OnboardingLayout>
  );
};

export default OnboardingPage; 