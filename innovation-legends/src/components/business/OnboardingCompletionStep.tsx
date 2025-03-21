import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { BusinessProfile } from '../../types';
import BusinessDNAAnimation from './BusinessDNAAnimation';

interface OnboardingCompletionStepProps {
  profile: Partial<BusinessProfile>;
  onComplete: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const OnboardingCompletionStep = ({ 
  profile, 
  onComplete, 
  onBack, 
  isSubmitting 
}: OnboardingCompletionStepProps) => {
  const [animationProgress, setAnimationProgress] = useState(0);
  
  // Animate progress on mount
  useEffect(() => {
    setAnimationProgress(100);
  }, []);
  
  const summaryItems = [
    { label: 'Business Name', value: profile.name || 'Not provided' },
    { label: 'Industry', value: profile.industry || 'Not provided' },
    { label: 'Size', value: profile.size || 'Not provided' },
    { label: 'Founded', value: profile.founded?.toString() || 'Not provided' },
    { label: 'Challenges', value: profile.challenges?.length 
      ? profile.challenges.join(', ')
      : 'None specified'
    },
    { label: 'Goals', value: profile.goals?.length 
      ? profile.goals.join(', ')
      : 'None specified'
    },
    { label: 'Innovation Readiness', value: `${profile.innovationReadiness || 0}%` },
    { label: 'Documents Uploaded', value: profile.documentData?.count 
      ? `${profile.documentData.count} document(s)`
      : 'None'
    }
  ];
  
  // Animation variants for staggered items
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="flex flex-col w-full">
      <h2 className="text-2xl font-semibold text-pure-white mb-2">Almost There!</h2>
      <p className="text-soft-silver mb-6">
        Review your business profile below and click "Complete" when you're ready to start your innovation journey.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Summary section */}
        <div className="md:col-span-2 bg-midnight-navy/50 rounded-lg border border-cosmic-slate/30 p-6">
          <h3 className="text-electric-blue font-medium mb-4">Business Profile Summary</h3>
          
          <motion.div 
            className="space-y-3"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {summaryItems.map((item, index) => (
              <motion.div 
                key={index}
                variants={item}
                className="grid grid-cols-2 gap-4 border-b border-cosmic-slate/20 pb-2"
              >
                <span className="text-ghost-gray">{item.label}:</span>
                <span className="text-pure-white">{item.value}</span>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="mt-8 p-4 bg-starfleet-blue/10 rounded-lg border border-starfleet-blue/30"
          >
            <p className="text-starfleet-blue">
              Your business profile is now set up! We'll use this information to customize your innovation
              strategy and provide targeted recommendations.
            </p>
          </motion.div>
        </div>
        
        {/* Visual representation */}
        <div className="bg-midnight-navy/50 rounded-lg border border-cosmic-slate/30 p-6 flex flex-col items-center">
          <h3 className="text-pure-white font-medium text-center mb-4">Your Business DNA</h3>
          
          <div className="flex-grow flex items-center justify-center">
            <BusinessDNAAnimation progress={animationProgress} />
          </div>
          
          <div className="w-full mt-4">
            <div className="text-center">
              <span className="text-3xl font-bold text-electric-blue">100%</span>
            </div>
            <div className="text-center mt-2">
              <span className="text-ghost-gray text-sm">Profile Complete</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <motion.button
          onClick={onBack}
          className="btn btn-secondary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isSubmitting}
        >
          Back
        </motion.button>
        
        <motion.button
          onClick={onComplete}
          disabled={isSubmitting}
          className="btn btn-primary"
          whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            "Complete"
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default OnboardingCompletionStep; 