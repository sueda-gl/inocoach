import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessProfile } from '../hooks/useBusinessProfile';
import { BusinessProfile } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';

// Import these components after we create them
// import OnboardingLayout from '../components/layout/OnboardingLayout';
// import BusinessProfileStep from '../components/business/BusinessProfileStep';
// import ChallengesStep from '../components/business/ChallengesStep';
// import GoalsStep from '../components/business/GoalsStep';
// import InnovationReadinessStep from '../components/business/InnovationReadinessStep';
// import OnboardingCompletionStep from '../components/business/OnboardingCompletionStep';

// Temporary placeholder components
const OnboardingLayout = ({ children, currentStep, totalSteps }: { children: React.ReactNode, currentStep: number, totalSteps: number }) => (
  <div className="min-h-screen bg-deep-space flex flex-col items-center justify-center p-4">
    <div className="w-full max-w-2xl card">
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

const BusinessProfileStep = ({ profile, onUpdate, onNext }: { 
  profile: Partial<BusinessProfile>, 
  onUpdate: (updates: Partial<BusinessProfile>) => void, 
  onNext: () => void 
}) => (
  <div>
    <h2 className="text-2xl font-semibold text-pure-white mb-6">Tell us about your business</h2>
    
    <div className="space-y-4">
      <div>
        <label className="block mb-2 text-soft-silver">Business Name</label>
        <input 
          type="text" 
          className="input w-full" 
          value={profile.name || ''} 
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Your Business Name"
        />
      </div>
      
      <div>
        <label className="block mb-2 text-soft-silver">Industry</label>
        <select 
          className="input w-full" 
          value={profile.industry || ''} 
          onChange={(e) => onUpdate({ industry: e.target.value })}
        >
          <option value="">Select Industry</option>
          <option value="technology">Technology</option>
          <option value="retail">Retail</option>
          <option value="healthcare">Healthcare</option>
          <option value="finance">Finance</option>
          <option value="manufacturing">Manufacturing</option>
          <option value="education">Education</option>
          <option value="hospitality">Hospitality</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div>
        <label className="block mb-2 text-soft-silver">Company Size</label>
        <select 
          className="input w-full" 
          value={profile.size || ''} 
          onChange={(e) => onUpdate({ size: e.target.value })}
        >
          <option value="">Select Size</option>
          <option value="1-10">1-10 employees</option>
          <option value="11-50">11-50 employees</option>
          <option value="51-200">51-200 employees</option>
          <option value="201-1000">201-1000 employees</option>
          <option value="1001+">1001+ employees</option>
        </select>
      </div>
      
      <div>
        <label className="block mb-2 text-soft-silver">Year Founded</label>
        <input 
          type="number" 
          className="input w-full" 
          value={profile.founded || ''} 
          onChange={(e) => onUpdate({ founded: parseInt(e.target.value) })}
          placeholder="e.g. 2010"
          min="1900"
          max={new Date().getFullYear()}
        />
      </div>
    </div>
    
    <div className="mt-8 flex justify-end">
      <button
        onClick={onNext}
        disabled={!profile.name || !profile.industry || !profile.size || !profile.founded}
        className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next Step
      </button>
    </div>
  </div>
);

const ChallengesStep = ({ challenges, onUpdate, onNext, onBack }: { 
  challenges: string[],
  onUpdate: (challenges: string[]) => void, 
  onNext: () => void,
  onBack: () => void
}) => {
  const [newChallenge, setNewChallenge] = useState('');
  
  const addChallenge = () => {
    if (newChallenge.trim() !== '') {
      onUpdate([...challenges, newChallenge.trim()]);
      setNewChallenge('');
    }
  };
  
  const removeChallenge = (index: number) => {
    const updated = challenges.filter((_, i) => i !== index);
    onUpdate(updated);
  };
  
  return (
    <div>
      <h2 className="text-2xl font-semibold text-pure-white mb-6">What challenges is your business facing?</h2>
      
      <div className="space-y-4">
        <div className="flex">
          <input 
            type="text" 
            className="input flex-grow" 
            value={newChallenge} 
            onChange={(e) => setNewChallenge(e.target.value)}
            placeholder="Enter a business challenge"
            onKeyDown={(e) => e.key === 'Enter' && addChallenge()}
          />
          <button 
            className="btn btn-secondary ml-2"
            onClick={addChallenge}
          >
            Add
          </button>
        </div>
        
        <div className="mt-4 space-y-2">
          {challenges.length === 0 && (
            <p className="text-ghost-gray italic">No challenges added yet. Add your first challenge above.</p>
          )}
          
          {challenges.map((challenge, index) => (
            <div key={index} className="flex items-center bg-cosmic-slate bg-opacity-40 p-3 rounded-md">
              <span className="flex-grow">{challenge}</span>
              <button 
                className="text-ghost-gray hover:text-coral-energy transition-colors"
                onClick={() => removeChallenge(index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="btn btn-secondary"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={challenges.length === 0}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Step
        </button>
      </div>
    </div>
  );
};

const GoalsStep = ({ goals, onUpdate, onNext, onBack }: { 
  goals: string[],
  onUpdate: (goals: string[]) => void, 
  onNext: () => void,
  onBack: () => void
}) => {
  const [newGoal, setNewGoal] = useState('');
  
  const addGoal = () => {
    if (newGoal.trim() !== '') {
      onUpdate([...goals, newGoal.trim()]);
      setNewGoal('');
    }
  };
  
  const removeGoal = (index: number) => {
    const updated = goals.filter((_, i) => i !== index);
    onUpdate(updated);
  };
  
  return (
    <div>
      <h2 className="text-2xl font-semibold text-pure-white mb-6">What are your business goals?</h2>
      
      <div className="space-y-4">
        <div className="flex">
          <input 
            type="text" 
            className="input flex-grow" 
            value={newGoal} 
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Enter a business goal"
            onKeyDown={(e) => e.key === 'Enter' && addGoal()}
          />
          <button 
            className="btn btn-secondary ml-2"
            onClick={addGoal}
          >
            Add
          </button>
        </div>
        
        <div className="mt-4 space-y-2">
          {goals.length === 0 && (
            <p className="text-ghost-gray italic">No goals added yet. Add your first goal above.</p>
          )}
          
          {goals.map((goal, index) => (
            <div key={index} className="flex items-center bg-cosmic-slate bg-opacity-40 p-3 rounded-md">
              <span className="flex-grow">{goal}</span>
              <button 
                className="text-ghost-gray hover:text-coral-energy transition-colors"
                onClick={() => removeGoal(index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="btn btn-secondary"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={goals.length === 0}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Step
        </button>
      </div>
    </div>
  );
};

const InnovationReadinessStep = ({ readiness, onUpdate, onNext, onBack }: { 
  readiness: number,
  onUpdate: (readiness: number) => void, 
  onNext: () => void,
  onBack: () => void
}) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-pure-white mb-6">How would you rate your innovation readiness?</h2>
      
      <div className="space-y-6">
        <p className="text-soft-silver">
          On a scale of 0-100, how ready is your organization to implement innovative ideas?
        </p>
        
        <div className="flex items-center space-x-4">
          <span className="text-ghost-gray">Not ready</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={readiness} 
            onChange={(e) => onUpdate(parseInt(e.target.value))}
            className="w-full h-2 bg-cosmic-slate rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-electric-blue"
          />
          <span className="text-ghost-gray">Very ready</span>
        </div>
        
        <div className="text-center">
          <span className="text-2xl font-medium text-electric-blue">{readiness}</span>
        </div>
        
        <div className="bg-cosmic-slate bg-opacity-30 p-4 rounded-md">
          {readiness < 30 && (
            <p>Your organization may need to focus on building a foundation for innovation before implementing major changes.</p>
          )}
          {readiness >= 30 && readiness < 60 && (
            <p>Your organization has some innovation capabilities but may need more structure and resources to excel.</p>
          )}
          {readiness >= 60 && readiness < 90 && (
            <p>Your organization is well-positioned for innovation but may still benefit from targeted improvements.</p>
          )}
          {readiness >= 90 && (
            <p>Your organization has excellent innovation readiness and is positioned to implement advanced strategies.</p>
          )}
        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="btn btn-secondary"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="btn btn-primary"
        >
          Next Step
        </button>
      </div>
    </div>
  );
};

const OnboardingCompletionStep = ({ profile, onComplete, onBack, isSubmitting }: { 
  profile: Partial<BusinessProfile>,
  onComplete: () => void,
  onBack: () => void,
  isSubmitting: boolean
}) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-pure-white mb-6">You're all set!</h2>
      
      <div className="space-y-6">
        <p className="text-soft-silver">
          Here's a summary of the information you've provided:
        </p>
        
        <div className="bg-cosmic-slate bg-opacity-30 p-4 rounded-md space-y-3">
          <div>
            <span className="text-ghost-gray">Business Name:</span>
            <span className="text-pure-white ml-2">{profile.name}</span>
          </div>
          <div>
            <span className="text-ghost-gray">Industry:</span>
            <span className="text-pure-white ml-2">{profile.industry}</span>
          </div>
          <div>
            <span className="text-ghost-gray">Size:</span>
            <span className="text-pure-white ml-2">{profile.size}</span>
          </div>
          <div>
            <span className="text-ghost-gray">Founded:</span>
            <span className="text-pure-white ml-2">{profile.founded}</span>
          </div>
          <div>
            <span className="text-ghost-gray">Challenges:</span>
            <span className="text-pure-white ml-2">{profile.challenges?.join(', ')}</span>
          </div>
          <div>
            <span className="text-ghost-gray">Goals:</span>
            <span className="text-pure-white ml-2">{profile.goals?.join(', ')}</span>
          </div>
          <div>
            <span className="text-ghost-gray">Innovation Readiness:</span>
            <span className="text-pure-white ml-2">{profile.innovationReadiness}/100</span>
          </div>
        </div>
        
        <p className="text-soft-silver">
          Press "Complete" to finish onboarding and access your Innovation Legends dashboard.
        </p>
      </div>
      
      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="btn btn-secondary"
          disabled={isSubmitting}
        >
          Back
        </button>
        <button
          onClick={onComplete}
          className="btn btn-primary flex items-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <motion.div 
                className="w-4 h-4 border-2 border-t-transparent border-white rounded-full mr-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Creating Profile...
            </>
          ) : 'Complete'}
        </button>
      </div>
    </div>
  );
};

// Initial business profile structure with default DNA segments
const initialBusinessDNASegments = [
  {
    id: uuidv4(),
    name: 'Innovation Culture',
    category: 'innovation',
    strength: 50,
    description: 'How well your organization embraces and supports new ideas',
    insights: ['Initial assessment based on your responses']
  },
  {
    id: uuidv4(),
    name: 'Financial Resources',
    category: 'finance',
    strength: 50,
    description: 'Available capital and financial flexibility for innovation',
    insights: ['Initial assessment based on your responses']
  },
  {
    id: uuidv4(),
    name: 'Market Awareness',
    category: 'marketing',
    strength: 50,
    description: 'Understanding of customer needs and market trends',
    insights: ['Initial assessment based on your responses']
  },
  {
    id: uuidv4(),
    name: 'Operational Efficiency',
    category: 'operations',
    strength: 50,
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
  
  const totalSteps = 5;
  
  const updateProfile = (updates: Partial<BusinessProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };
  
  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      // Ensure the profile is complete
      const completeProfile = {
        ...profile,
        // Add any missing default values if needed
        challenges: profile.challenges || [],
        goals: profile.goals || [],
        innovationReadiness: profile.innovationReadiness || 50,
        dnaSegments: profile.dnaSegments || initialBusinessDNASegments
      };
      
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
    switch (currentStep) {
      case 1:
        return (
          <BusinessProfileStep
            profile={profile}
            onUpdate={updateProfile}
            onNext={handleNextStep}
          />
        );
      case 2:
        return (
          <ChallengesStep
            challenges={profile.challenges || []}
            onUpdate={(challenges) => updateProfile({ challenges })}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 3:
        return (
          <GoalsStep
            goals={profile.goals || []}
            onUpdate={(goals) => updateProfile({ goals })}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 4:
        return (
          <InnovationReadinessStep
            readiness={profile.innovationReadiness || 50}
            onUpdate={(innovationReadiness) => updateProfile({ innovationReadiness })}
            onNext={handleNextStep}
            onBack={handlePreviousStep}
          />
        );
      case 5:
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