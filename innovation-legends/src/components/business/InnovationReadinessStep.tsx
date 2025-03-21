import { useState } from 'react';
import { motion } from 'framer-motion';
import BusinessDNAAnimation from './BusinessDNAAnimation';

interface InnovationReadinessStepProps {
  readiness: number;
  onUpdate: (readiness: number) => void;
  onNext: () => void;
  onBack: () => void;
}

const InnovationReadinessStep = ({ 
  readiness, 
  onUpdate, 
  onNext, 
  onBack 
}: InnovationReadinessStepProps) => {
  const [localReadiness, setLocalReadiness] = useState(readiness);
  
  const handleReadinessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setLocalReadiness(value);
    onUpdate(value);
  };
  
  // Get descriptive text based on readiness level
  const getReadinessDescription = (value: number) => {
    if (value < 25) {
      return "Your organization is in the early stages of innovation capability. We'll help you build the foundation.";
    } else if (value < 50) {
      return "You have some innovation practices in place. We'll help strengthen and expand them.";
    } else if (value < 75) {
      return "You have solid innovation processes. We'll help refine and integrate them across your organization.";
    } else {
      return "Your organization has advanced innovation capabilities. We'll help you push boundaries and stay ahead.";
    }
  };
  
  return (
    <div className="flex flex-col w-full">
      <h2 className="text-2xl font-semibold text-pure-white mb-2">Innovation Readiness</h2>
      <p className="text-soft-silver mb-6">
        How would you rate your organization's current innovation capabilities?
      </p>
      
      <div className="bg-midnight-navy/50 rounded-lg border border-cosmic-slate/30 p-6 mb-8">
        <div className="flex flex-col items-center mb-6">
          <div className="text-6xl font-bold text-electric-blue mb-2">
            {localReadiness}%
          </div>
          <div className="w-full max-w-lg">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={localReadiness}
              onChange={handleReadinessChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-ghost-gray mt-1">
              <span>Beginner</span>
              <span>Developing</span>
              <span>Established</span>
              <span>Advanced</span>
            </div>
          </div>
        </div>
        
        <div className="bg-cosmic-slate/30 p-4 rounded-lg mt-4">
          <p className="text-soft-silver">
            {getReadinessDescription(localReadiness)}
          </p>
        </div>
        
        <div className="mt-6 space-y-4">
          <h3 className="text-electric-blue font-medium">What this means:</h3>
          <ul className="space-y-2 text-ghost-gray">
            <li className="flex items-start">
              <span className="mr-2 text-electric-blue">•</span>
              <span>This helps us customize our innovation recommendations to your current capabilities</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-electric-blue">•</span>
              <span>We'll provide strategies that match your organization's readiness level</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-electric-blue">•</span>
              <span>You'll see this reflected in your Innovation DNA profile</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <motion.button
          onClick={onBack}
          className="btn btn-secondary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Back
        </motion.button>
        
        <motion.button
          onClick={onNext}
          className="btn btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Next
        </motion.button>
      </div>
    </div>
  );
};

export default InnovationReadinessStep; 