import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import ChatInterface from '../chat/ChatInterface';
import BusinessDNAAnimation from './BusinessDNAAnimation';
import { BusinessProfile } from '../../types';
import { getLLMResponse } from '../../services/openai';

// Conversation logic types
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatBasedChallengesGoalsStepProps {
  businessProfile: Partial<BusinessProfile>;
  onUpdate: (updates: Partial<BusinessProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Helper function to extract challenges and goals from messages
const extractChallengesAndGoals = (messages: Message[]): { challenges: string[], goals: string[] } => {
  const challenges: string[] = [];
  const goals: string[] = [];
  
  // Simple pattern matching for demonstration purposes
  // In a real application, this would be more sophisticated with NLP
  messages.forEach(message => {
    if (message.sender === 'user') {
      const text = message.text;
      
      // Look for challenges
      if (/challenge|problem|struggle|difficult|hurdle|obstacle/i.test(text)) {
        // Split by common delimiters and look for potential challenges
        const lines = text.split(/[,.;\n]+/);
        lines.forEach(line => {
          // If line contains challenge-related words and is reasonably long
          if (/challenge|problem|struggle|difficult|hurdle|obstacle/i.test(line) && line.length > 15) {
            const cleanLine = line.trim()
              .replace(/^(our|my|we have a|one) (challenge|problem|struggle|difficulty) (is|:)/i, '')
              .replace(/^(we|i) (struggle|are struggling) with/i, '')
              .trim();
            
            if (cleanLine && cleanLine.length > 5 && !challenges.includes(cleanLine)) {
              challenges.push(cleanLine);
            }
          }
        });
      }
      
      // Look for goals
      if (/goal|aim|target|objective|aspire|hope to|want to|plan to/i.test(text)) {
        // Split by common delimiters and look for potential goals
        const lines = text.split(/[,.;\n]+/);
        lines.forEach(line => {
          // If line contains goal-related words and is reasonably long
          if (/goal|aim|target|objective|aspire|hope to|want to|plan to/i.test(line) && line.length > 15) {
            const cleanLine = line.trim()
              .replace(/^(our|my|we have a|one) (goal|objective|aim|target) (is|:)/i, '')
              .replace(/^(we|i) (want|hope|plan|aim|aspire) to/i, '')
              .trim();
            
            if (cleanLine && cleanLine.length > 5 && !goals.includes(cleanLine)) {
              goals.push(cleanLine);
            }
          }
        });
      }
    }
  });
  
  return { challenges, goals };
};

// Initial conversation steps
const initialMessages: Message[] = [
  {
    id: uuidv4(),
    text: "Now, let's talk about your business challenges and goals. Understanding these will help me tailor innovation strategies for you.",
    sender: 'ai',
    timestamp: new Date()
  },
  {
    id: uuidv4(),
    text: "What are the main challenges your business is currently facing?",
    sender: 'ai',
    timestamp: new Date(Date.now() + 1000)
  }
];

// Followup questions based on what information we have
const getFollowupQuestion = (
  profile: Partial<BusinessProfile>, 
  hasChallenges: boolean, 
  hasGoals: boolean
): string => {
  if (!hasChallenges) {
    return "What challenges or problems is your business currently facing?";
  }
  
  if (!hasGoals) {
    return "What are your business goals or objectives for the next year or two?";
  }
  
  return "Thanks for sharing your challenges and goals. Is there anything else you'd like to add before we continue?";
};

const ChatBasedChallengesGoalsStep = ({ 
  businessProfile, 
  onUpdate, 
  onNext, 
  onBack 
}: ChatBasedChallengesGoalsStepProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [challenges, setChallenges] = useState<string[]>(businessProfile.challenges || []);
  const [goals, setGoals] = useState<string[]>(businessProfile.goals || []);
  const [animationProgress, setAnimationProgress] = useState(25); // Starting from 25% (after first step)
  const [askedAboutGoals, setAskedAboutGoals] = useState(false);
  
  // Extract challenges and goals from messages
  useEffect(() => {
    const { challenges: extractedChallenges, goals: extractedGoals } = extractChallengesAndGoals(messages);
    
    // Update local state
    if (extractedChallenges.length > 0 && !challenges.every(c => extractedChallenges.includes(c))) {
      setChallenges(extractedChallenges);
    }
    
    if (extractedGoals.length > 0 && !goals.every(g => extractedGoals.includes(g))) {
      setGoals(extractedGoals);
    }
    
    // Calculate progress based on having both challenges and goals
    if (extractedChallenges.length > 0 && extractedGoals.length > 0) {
      setAnimationProgress(
        25 + // Base from previous step
        (Math.min(3, extractedChallenges.length) / 3) * 25 + // Up to 25% for challenges
        (Math.min(3, extractedGoals.length) / 3) * 25 // Up to 25% for goals
      );
    } else if (extractedChallenges.length > 0) {
      setAnimationProgress(
        25 + // Base from previous step
        (Math.min(3, extractedChallenges.length) / 3) * 25 // Up to 25% for challenges
      );
    }
  }, [messages, challenges, goals]);
  
  // Update parent component when challenges or goals change
  useEffect(() => {
    // Only update if we have actual data to update with
    if (challenges.length > 0 || goals.length > 0) {
      onUpdate({
        challenges: challenges.length > 0 ? challenges : undefined,
        goals: goals.length > 0 ? goals : undefined
      });
    }
  }, [challenges, goals, onUpdate]);
  
  // Handle user sending a message
  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      // Create the system prompt for challenges and goals extraction
      let systemPrompt = `You are an AI Innovation Coach helping a business identify their challenges and goals.
Your task is to have a natural conversation while identifying business challenges and future goals.
Keep responses conversational, positive, and concise (2-3 sentences max).
If the user mentions challenges, acknowledge them and then ask about their goals.
If they mention goals, acknowledge them and suggest they move to the next step.`;

      // Include business profile information for context
      if (businessProfile.name || businessProfile.industry || businessProfile.size || businessProfile.founded) {
        systemPrompt += `\n\nBUSINESS PROFILE INFORMATION:`;
        
        if (businessProfile.name) {
          systemPrompt += `\nBusiness Name: ${businessProfile.name}`;
        }
        
        if (businessProfile.industry) {
          systemPrompt += `\nIndustry: ${businessProfile.industry}`;
        }
        
        if (businessProfile.size) {
          systemPrompt += `\nSize: ${businessProfile.size}`;
        }
        
        if (businessProfile.founded) {
          systemPrompt += `\nFounded: ${businessProfile.founded}`;
        }
        
        systemPrompt += `\n\nUse this business context to provide industry-specific and size-appropriate suggestions when discussing challenges and goals.`;
      }
      
      // Include any existing challenges and goals
      if (challenges.length > 0 || goals.length > 0) {
        systemPrompt += `\n\nEXISTING INFORMATION:`;
        
        if (challenges.length > 0) {
          systemPrompt += `\nChallenges identified so far:`;
          challenges.forEach(challenge => {
            systemPrompt += `\n- ${challenge}`;
          });
        }
        
        if (goals.length > 0) {
          systemPrompt += `\nGoals identified so far:`;
          goals.forEach(goal => {
            systemPrompt += `\n- ${goal}`;
          });
        }
        
        systemPrompt += `\n\nBuild upon this information in your responses. Confirm these details and explore other potential challenges or goals.`;
      }
      
      // Debug the prompt
      console.log('System prompt:', systemPrompt);
      
      // Get response from OpenAI
      const allMessages = [...messages, userMessage];
      const aiResponseText = await getLLMResponse(allMessages, systemPrompt);
      
      // Extract challenges and goals
      const { challenges: extractedChallenges, goals: extractedGoals } = extractChallengesAndGoals([
        ...allMessages
      ]);
      
      console.log('Extracted challenges:', extractedChallenges);
      console.log('Extracted goals:', extractedGoals);
      
      // Update challenges and goals if new ones were found
      if (extractedChallenges.length > 0) {
        setChallenges(extractedChallenges);
      }
      
      if (extractedGoals.length > 0) {
        setGoals(extractedGoals);
      }
      
      // If nothing extracted but message is substantial
      if (extractedChallenges.length === 0 && extractedGoals.length === 0 && text.length > 20) {
        if (askedAboutGoals && goals.length === 0) {
          setGoals([text.trim()]);
        } else if (challenges.length === 0) {
          setChallenges([text.trim()]);
        }
      }
      
      // Create AI response message
      const aiMessage: Message = {
        id: uuidv4(),
        text: aiResponseText || getFollowupQuestion(businessProfile, challenges.length > 0, goals.length > 0),
        sender: 'ai',
        timestamp: new Date()
      };
      
      // Add the AI message to the chat
      setIsTyping(false);
      setMessages(prev => [...prev, aiMessage]);
      
      // If we have both challenges and goals, suggest moving to the next step
      if (challenges.length > 0 && goals.length > 0) {
        setIsTyping(true);
        setTimeout(() => {
          const completionMessage: Message = {
            id: uuidv4(),
            text: "Perfect! I've recorded your challenges and goals. Click 'Next' when you're ready to continue.",
            sender: 'ai',
            timestamp: new Date()
          };
          
          setIsTyping(false);
          setMessages(prev => [...prev, completionMessage]);
          setAnimationProgress(75);
        }, 1000);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsTyping(false);
    }
  };
  
  // Check if we have enough information to proceed
  const hasRequiredInfo = challenges.length > 0 && goals.length > 0;
  
  return (
    <div className="flex flex-col w-full">
      <h2 className="text-2xl font-semibold text-pure-white mb-2">Challenges & Goals</h2>
      <p className="text-soft-silver mb-6">Tell me about your business challenges and goals so I can help you innovate effectively.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
        {/* Chat interface */}
        <div className="md:col-span-2 bg-midnight-navy/50 rounded-lg border border-cosmic-slate/30 overflow-hidden shadow-lg">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
            placeholder="Share your challenges and goals..."
          />
        </div>
        
        {/* Visual representation */}
        <div className="flex flex-col bg-midnight-navy/50 rounded-lg border border-cosmic-slate/30 p-6 shadow-lg">
          <h3 className="text-pure-white font-medium text-center mb-4">Your Business DNA</h3>
          
          <div className="flex-grow flex items-center justify-center">
            <BusinessDNAAnimation 
              progress={animationProgress} 
              color="#F56565" // coral-energy
            />
          </div>
          
          {/* Extracted information summary */}
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-electric-blue font-medium mb-2">Challenges Identified:</h4>
              {challenges.length === 0 ? (
                <p className="text-ghost-gray italic text-sm">No challenges identified yet...</p>
              ) : (
                <ul className="list-disc pl-5 space-y-1">
                  {challenges.map((challenge, index) => (
                    <li key={index} className="text-soft-silver text-sm">{challenge}</li>
                  ))}
                </ul>
              )}
            </div>
            
            <div>
              <h4 className="text-teal-pulse font-medium mb-2">Goals Identified:</h4>
              {goals.length === 0 ? (
                <p className="text-ghost-gray italic text-sm">No goals identified yet...</p>
              ) : (
                <ul className="list-disc pl-5 space-y-1">
                  {goals.map((goal, index) => (
                    <li key={index} className="text-soft-silver text-sm">{goal}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="btn btn-secondary"
        >
          Back
        </button>
        <motion.button
          onClick={onNext}
          disabled={!hasRequiredInfo}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: !hasRequiredInfo ? 1 : 1.05 }}
          whileTap={{ scale: !hasRequiredInfo ? 1 : 0.95 }}
        >
          Next Step
        </motion.button>
      </div>
    </div>
  );
};

export default ChatBasedChallengesGoalsStep; 