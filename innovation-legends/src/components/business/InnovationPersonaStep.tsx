import { useState } from 'react';
import { motion } from 'framer-motion';
import { BusinessProfile, InnovationPersona, InnovationPersonaType } from '../../types';

interface InnovationPersonaStepProps {
  businessProfile: Partial<BusinessProfile>;
  onUpdate: (updates: Partial<BusinessProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Questions designed to help classify the innovation persona
const innovationQuestions = [
  {
    id: 'innovation_familiarity',
    text: 'How familiar are you with innovation concepts and methodologies?',
    options: [
      { value: 'not_familiar', text: 'Not familiar at all', persona: 'clueless' },
      { value: 'somewhat_familiar', text: 'I know a few basics', persona: 'clueless' },
      { value: 'moderately_familiar', text: 'Moderately familiar', persona: 'hesitant' },
      { value: 'very_familiar', text: 'Very familiar', persona: 'motivated' }
    ]
  },
  {
    id: 'innovation_attempts',
    text: 'Have you attempted to implement innovation initiatives in your business before?',
    options: [
      { value: 'never', text: 'Never', persona: 'clueless' },
      { value: 'tried_failed', text: 'Yes, but it didn\'t work well', persona: 'hesitant' },
      { value: 'some_success', text: 'Yes, with some success', persona: 'motivated' },
      { value: 'not_sure', text: 'Not sure what counts as innovation', persona: 'clueless' }
    ]
  },
  {
    id: 'innovation_feelings',
    text: 'How do you feel about implementing new, unproven ideas in your business?',
    options: [
      { value: 'excited', text: 'Excited to try new things', persona: 'motivated' },
      { value: 'cautious', text: 'Cautious but open', persona: 'hesitant' },
      { value: 'worried', text: 'Worried about risks and costs', persona: 'hesitant' },
      { value: 'confused', text: 'Unsure how to approach it', persona: 'clueless' }
    ]
  },
  {
    id: 'innovation_barriers',
    text: 'What\'s your biggest barrier to innovation?',
    options: [
      { value: 'knowledge', text: 'Not knowing where to start', persona: 'clueless' },
      { value: 'resources', text: 'Lack of resources or time', persona: 'motivated' },
      { value: 'risk', text: 'Concerns about failure or costs', persona: 'hesitant' },
      { value: 'culture', text: 'Resistance to change in the organization', persona: 'hesitant' }
    ]
  },
  {
    id: 'innovation_support',
    text: 'What type of innovation support would be most valuable to you?',
    options: [
      { value: 'education', text: 'Learning the basics and concepts', persona: 'clueless' },
      { value: 'tools', text: 'Practical tools and frameworks', persona: 'motivated' },
      { value: 'examples', text: 'Success stories and case studies', persona: 'hesitant' },
      { value: 'guidance', text: 'Step-by-step guidance', persona: 'motivated' }
    ]
  }
];

const InnovationPersonaStep = ({ 
  businessProfile, 
  onUpdate, 
  onNext, 
  onBack 
}: InnovationPersonaStepProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  // Store answer for a question
  const handleSelectOption = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Determine if all questions have been answered
  const allQuestionsAnswered = innovationQuestions.every(q => answers[q.id]);

  // Classify the persona based on answers
  const classifyPersona = (): InnovationPersona => {
    // Count occurrences of each persona type
    const personaCounts: Record<InnovationPersonaType, number> = {
      'clueless': 0,
      'motivated': 0,
      'hesitant': 0
    };

    // For each answer, increment the count for the corresponding persona
    innovationQuestions.forEach(question => {
      const answer = answers[question.id];
      if (answer) {
        const selectedOption = question.options.find(option => option.value === answer);
        if (selectedOption) {
          personaCounts[selectedOption.persona as InnovationPersonaType]++;
        }
      }
    });

    // Determine the dominant persona
    let dominantPersona: InnovationPersonaType = 'clueless';
    let maxCount = 0;
    
    (Object.entries(personaCounts) as [InnovationPersonaType, number][]).forEach(([persona, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantPersona = persona;
      }
    });

    // Determine confidence based on how clear the dominance is
    const totalQuestions = innovationQuestions.length;
    const dominantPercentage = (maxCount / totalQuestions) * 100;
    
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    if (dominantPercentage >= 70) {
      confidence = 'high';
    } else if (dominantPercentage <= 40) {
      confidence = 'low';
    }

    // Generate explanation based on persona
    let explanation = '';
    switch (dominantPersona) {
      case 'clueless':
        explanation = 'Your responses indicate you may be new to innovation concepts and could benefit from foundational knowledge about innovation processes and their application to your business.';
        break;
      case 'motivated' as InnovationPersonaType:
        explanation = 'Your responses show enthusiasm for innovation but you may need more structure and resources to implement your ideas effectively.';
        break;
      case 'hesitant' as InnovationPersonaType:
        explanation = 'Your responses suggest you understand innovation but may have concerns about risks and returns that are holding you back from fully embracing it.';
        break;
    }

    return {
      type: dominantPersona,
      confidence,
      explanation
    };
  };

  // Handle submission of all answers
  const handleSubmit = () => {
    const persona = classifyPersona();
    onUpdate({ innovationPersona: persona });
    setIsComplete(true);
  };

  // Handle proceeding to next step
  const handleNext = () => {
    if (!isComplete) {
      handleSubmit();
    }
    onNext();
  };

  return (
    <div className="flex flex-col w-full">
      <h2 className="text-2xl font-semibold text-pure-white mb-2">Your Innovation Approach</h2>
      <p className="text-soft-silver mb-6">
        Answer these questions to help us understand how to best support your innovation journey.
      </p>
      
      <div className="bg-midnight-navy/50 rounded-lg border border-cosmic-slate/30 p-6 mb-8 space-y-8">
        {innovationQuestions.map((question, index) => (
          <div key={question.id} className="space-y-4">
            <h3 className="text-pure-white font-medium text-lg flex items-center">
              <span className="w-6 h-6 flex items-center justify-center bg-electric-blue/20 text-electric-blue rounded-full mr-2">
                {index + 1}
              </span>
              {question.text}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {question.options.map(option => (
                <motion.div
                  key={option.value}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    answers[question.id] === option.value
                      ? 'bg-starfleet-blue/20 border-starfleet-blue'
                      : 'bg-cosmic-slate/20 border-cosmic-slate/30 hover:border-cosmic-slate/70'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectOption(question.id, option.value)}
                >
                  <p className="text-pure-white">{option.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
        
        {isComplete && businessProfile.innovationPersona && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-midnight-navy bg-opacity-60 p-5 rounded-lg border border-electric-blue/30 mt-6"
          >
            <h3 className="text-xl font-medium text-electric-blue mb-2">Your Innovation Profile</h3>
            <p className="text-soft-silver mb-4">{businessProfile.innovationPersona.explanation}</p>
            <div className="text-ghost-gray text-sm">
              This helps us personalize your experience with our AI coaches.
            </div>
          </motion.div>
        )}
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
          onClick={handleNext}
          className="btn btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!allQuestionsAnswered}
        >
          {isComplete ? 'Next' : 'Analyze & Continue'}
        </motion.button>
      </div>
    </div>
  );
};

export default InnovationPersonaStep; 