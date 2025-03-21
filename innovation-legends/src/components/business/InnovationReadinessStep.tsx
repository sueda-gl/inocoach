import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BusinessDNAAnimation from './BusinessDNAAnimation';

interface InnovationReadinessStepProps {
  readiness: number;
  onUpdate: (readiness: number) => void;
  onNext: () => void;
  onBack: () => void;
}

const getReadinessDescription = (readiness: number): string => {
  if (readiness < 25) {
    return "You're at the early stages of your innovation journey. We'll help you build a strong foundation.";
  } else if (readiness < 50) {
    return "You have some innovation practices in place. Let's strengthen and expand them.";
  } else if (readiness < 75) {
    return "You have solid innovation capabilities. We'll help you take them to the next level.";
  } else {
    return "You're already an innovation leader! We'll focus on maintaining your edge and exploring new frontiers.";
  }
};

const InnovationReadinessStep = ({ readiness, onUpdate, onNext, onBack }: InnovationReadinessStepProps) => {
  const [animationProgress, setAnimationProgress] = useState(50);

  // Update animation progress based on readiness
  useEffect(() => {
    setAnimationProgress(readiness);
  }, [readiness]);

  return (
    <div className="flex flex-col w-full">
      <h2 className="text-2xl font-semibold text-pure-white mb-2">Rate Your Innovation Readiness</h2>
      <p className="text-soft-silver mb-6">
        How would you rate your organization's current innovation capabilities?
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rating slider and description */}
        <div className="md:col-span-2 bg-midnight-navy/50 rounded-lg border border-cosmic-slate/30 p-6 flex flex-col">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <label className="block text-pure-white mb-2">Innovation Readiness ({readiness}%)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={readiness}
              onChange={(e) => onUpdate(parseInt(e.target.value))}
              className="w-full h-2 bg-cosmic-slate rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-ghost-gray mt-1">
              <span>Beginner</span>
              <span>Developing</span>
              <span>Established</span>
              <span>Leader</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-midnight-navy/70 p-4 rounded-lg border border-cosmic-slate/20"
          >
            <h3 className="text-electric-blue font-medium mb-2">Assessment</h3>
            <p className="text-soft-silver">{getReadinessDescription(readiness)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-auto"
          >
            <h3 className="text-electric-blue font-medium mt-6 mb-2">What this means</h3>
            <p className="text-soft-silver">
              Your self-assessment helps us tailor our recommendations and tools to your specific needs.
              We'll focus on the areas where you need the most support while leveraging your existing strengths.
            </p>
          </motion.div>
        </div>

        {/* Visual representation */}
        <div className="bg-midnight-navy/50 rounded-lg border border-cosmic-slate/30 p-6 flex flex-col items-center">
          <h3 className="text-pure-white font-medium text-center mb-4">Innovation Readiness</h3>
          
          <div className="flex-grow flex items-center justify-center">
            <BusinessDNAAnimation progress={animationProgress} />
          </div>
          
          <div className="w-full mt-4">
            <div className="text-center">
              <span className="text-3xl font-bold text-electric-blue">{readiness}%</span>
            </div>
            <div className="text-center mt-2">
              <span className="text-ghost-gray text-sm">
                {readiness < 25 ? 'Beginner' : 
                 readiness < 50 ? 'Developing' : 
                 readiness < 75 ? 'Established' : 'Leader'}
              </span>
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
        >
          Back
        </motion.button>
        
        <motion.button
          onClick={onNext}
          className="btn btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Next Step
        </motion.button>
      </div>
    </div>
  );
};

export default InnovationReadinessStep; 