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

interface ChatBasedProfileStepProps {
  businessProfile: Partial<BusinessProfile>;
  onUpdate: (updates: Partial<BusinessProfile>) => void;
  onNext: () => void;
  onBack?: () => void;
}

// Helper function to extract business information from messages
const extractBusinessInfo = (messages: Message[]): Partial<BusinessProfile> => {
  const businessInfo: Partial<BusinessProfile> = {};
  
  // Process each message to extract business information
  messages.forEach(message => {
    if (message.sender === 'user') {
      const text = message.text.toLowerCase();
      
      // Look for business name
      if (!businessInfo.name && (text.includes('name is') || text.includes('called') || text.includes('business name') || messages.length <= 3)) {
        const matches = text.match(/(?:name is|called|business name)[^\w]+([\w\s&'-]+)/i);
        if (matches && matches[1]) {
          businessInfo.name = matches[1].trim();
        } else {
          // If no pattern match but likely contains name, use the first sentence or whole message
          const firstSentence = text.split(/[.!?]/, 1)[0].trim();
          if (firstSentence.length > 1 && firstSentence.length < 50) {
            businessInfo.name = firstSentence;
          }
        }
        
        // If we found a name but it's too short or just gibberish, don't use it
        if (businessInfo.name && businessInfo.name.length < 2) {
          delete businessInfo.name;
        }
      }
      
      // Look for industry - expanded to catch more variations
      if (!businessInfo.industry) {
        const industries = [
          { keywords: ['tech', 'software', 'it ', 'digital', 'computer', 'technology', 'app', 'web', 'online', 'internet', 'development'], value: 'technology' },
          { keywords: ['shop', 'store', 'sell', 'retail', 'commerce', 'ecommerce', 'e-commerce', 'market', 'buy', 'product'], value: 'retail' },
          { keywords: ['hospital', 'medical', 'health', 'care', 'clinic', 'doctor', 'patient', 'wellness', 'therapy'], value: 'healthcare' },
          { keywords: ['bank', 'financial', 'invest', 'money', 'finance', 'insurance', 'loan', 'banking', 'payment'], value: 'finance' },
          { keywords: ['factory', 'product', 'manufacturing', 'make', 'produce', 'production', 'build', 'assemble'], value: 'manufacturing' },
          { keywords: ['school', 'teach', 'education', 'learning', 'academic', 'university', 'college', 'student', 'training'], value: 'education' },
          { keywords: ['hotel', 'restaurant', 'food', 'hospitality', 'travel', 'tourism', 'service', 'guest', 'vacation'], value: 'hospitality' }
        ];
        
        // Try direct extraction from keywords
        for (const industry of industries) {
          if (industry.keywords.some(keyword => text.includes(keyword))) {
            businessInfo.industry = industry.value;
            break;
          }
        }
        
        // If we can't extract from keywords, check if the text directly contains a predefined industry name
        if (!businessInfo.industry) {
          const industryNames = ['technology', 'tech', 'retail', 'healthcare', 'health', 'finance', 'financial', 
                                'manufacturing', 'education', 'hospitality', 'service', 'consulting', 'food'];
          for (const name of industryNames) {
            if (text === name || text.includes(` ${name} `) || text.includes(` ${name}.`) || 
                text.includes(`${name} `) || text.startsWith(name) || text.endsWith(name)) {
              // Map to standardized industry names
              if (name === 'tech') businessInfo.industry = 'technology';
              else if (name === 'health') businessInfo.industry = 'healthcare';
              else if (name === 'financial') businessInfo.industry = 'finance';
              else if (name === 'service' || name === 'consulting') businessInfo.industry = 'professional services';
              else if (name === 'food') businessInfo.industry = 'hospitality';
              else businessInfo.industry = name;
              break;
            }
          }
        }
      }
      
      // Look for company size - simplified detection
      if (!businessInfo.size) {
        // First try with explicit size mentions
        if (text.includes('employee') || text.includes('people') || text.includes('staff') || text.includes('team')) {
          if (text.includes('1-10') || /\b(small|tiny|micro|few|1-10|under 10|small team|just me|solo|myself)\b/.test(text)) {
            businessInfo.size = '1-10';
          } else if (text.includes('11-50') || /\b(small-medium|dozen|11-50|under 50|small company)\b/.test(text)) {
            businessInfo.size = '11-50';
          } else if (text.includes('51-200') || /\b(medium|growing|51-200|under 200|mid-size)\b/.test(text)) {
            businessInfo.size = '51-200';
          } else if (text.includes('201-1000') || /\b(large|201-1000|several hundred|big company)\b/.test(text)) {
            businessInfo.size = '201-1000';
          } else if (text.includes('1001+') || /\b(enterprise|huge|1001|thousands|very large)\b/.test(text)) {
            businessInfo.size = '1001+';
          } else {
            // Default to small if size is mentioned but not specific
            businessInfo.size = '1-10';
          }
        }
        // Number extraction as fallback
        else if (/\b\d+\s+(employee|people|staff|team|person)\b/.test(text)) {
          const matches = text.match(/\b(\d+)\s+(employee|people|staff|team|person)/);
          if (matches && matches[1]) {
            const count = parseInt(matches[1]);
            if (count <= 10) businessInfo.size = '1-10';
            else if (count <= 50) businessInfo.size = '11-50';
            else if (count <= 200) businessInfo.size = '51-200';
            else if (count <= 1000) businessInfo.size = '201-1000';
            else businessInfo.size = '1001+';
          }
        }
        // Single-word size mentions
        else if (/\b(small|tiny|micro|medium|large|huge|big)\b/.test(text)) {
          if (/\b(small|tiny|micro)\b/.test(text)) {
            businessInfo.size = '1-10';
          } else if (/\bmedium\b/.test(text)) {
            businessInfo.size = '51-200';
          } else if (/\b(large|big)\b/.test(text)) {
            businessInfo.size = '201-1000';
          } else if (/\bhuge\b/.test(text)) {
            businessInfo.size = '1001+';
          }
        }
        // Exact numeric input (just a number)
        else if (/^\d+$/.test(text.trim())) {
          const count = parseInt(text.trim());
          if (count <= 10) businessInfo.size = '1-10';
          else if (count <= 50) businessInfo.size = '11-50';
          else if (count <= 200) businessInfo.size = '51-200';
          else if (count <= 1000) businessInfo.size = '201-1000';
          else businessInfo.size = '1001+';
        }
      }
      
      // Look for founding year
      if (!businessInfo.founded) {
        const yearMatches = text.match(/(?:founded|started|established|since|in)[^\d]*(\d{4})/i);
        if (yearMatches && yearMatches[1]) {
          const year = parseInt(yearMatches[1]);
          if (year >= 1900 && year <= new Date().getFullYear()) {
            businessInfo.founded = year;
          }
        } else if (text.includes('founded') || text.includes('started') || text.includes('established')) {
          // If year not found but mentions founding, use a recent year
          businessInfo.founded = new Date().getFullYear() - 5;
        } else if (/^\d{4}$/.test(text.trim())) {
          // If input is just a 4-digit number in a reasonable range, assume it's a year
          const year = parseInt(text.trim());
          if (year >= 1900 && year <= new Date().getFullYear()) {
            businessInfo.founded = year;
          }
        }
      }
    }
  });
  
  return businessInfo;
};

// Initial conversation steps
const initialMessages: Message[] = [
  {
    id: uuidv4(),
    text: "👋 Hi there! I'm your Innovation Coach. Let's get to know your business better so I can help you innovate effectively.",
    sender: 'ai',
    timestamp: new Date()
  },
  {
    id: uuidv4(),
    text: "Could you tell me about your business? What's it called, what industry are you in, and roughly how many employees do you have?",
    sender: 'ai',
    timestamp: new Date(Date.now() + 1000)
  }
];

// Followup questions based on what information is still missing
const getFollowupQuestion = (profile: Partial<BusinessProfile>): string => {
  if (!profile.name) {
    return "I don't think I caught your business name. What's your company called?";
  }
  if (!profile.industry) {
    return "What industry does your business operate in? For example: technology, retail, healthcare...";
  }
  if (!profile.size) {
    return "Could you tell me about the size of your team? How many employees does your business have?";
  }
  if (!profile.founded) {
    return "When was your business founded? What year did you get started?";
  }
  
  return "Thanks for sharing that information about your business. Is there anything else you'd like to add before we move on?";
};

const ChatBasedProfileStep = ({ 
  businessProfile, 
  onUpdate, 
  onNext, 
  onBack 
}: ChatBasedProfileStepProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [extractedProfile, setExtractedProfile] = useState<Partial<BusinessProfile>>({});
  const [animationProgress, setAnimationProgress] = useState(5);
  
  // Extract business info from messages and update local state
  useEffect(() => {
    const extracted = extractBusinessInfo(messages);
    
    // Calculate progress based on filled fields (4 main fields)
    const requiredFields = ['name', 'industry', 'size', 'founded'];
    const filledFields = requiredFields.filter(field => !!extracted[field as keyof typeof extracted]);
    const progress = Math.min(100, 5 + (filledFields.length / requiredFields.length) * 70);
    
    setAnimationProgress(progress);
    setExtractedProfile(prev => ({ ...prev, ...extracted }));
  }, [messages]);
  
  // Only update parent when extractedProfile changes
  useEffect(() => {
    // Prevent updating with empty object on initial render
    if (Object.keys(extractedProfile).length > 0) {
      console.log('Updating parent with profile:', extractedProfile);
      
      // Make sure we're not overwriting existing data with undefined values
      const cleanedUpdates = Object.fromEntries(
        Object.entries(extractedProfile).filter(([_, value]) => value !== undefined)
      );
      
      // Only update if we have actual data to update
      if (Object.keys(cleanedUpdates).length > 0) {
        onUpdate(cleanedUpdates);
      }
      
      // Check if we have all required fields
      const hasRequired = !!extractedProfile.name && 
                         !!extractedProfile.industry && 
                         !!extractedProfile.size && 
                         !!extractedProfile.founded;
      
      if (hasRequired) {
        console.log('All required fields provided - ready for next step');
      }
    }
  }, [extractedProfile, onUpdate]);
  
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
      // Create the system prompt for the profile extraction
      let systemPrompt = `You are an AI Innovation Coach helping a business create their profile.
Extract information about: business name, industry, company size, and founding year.
Keep your responses conversational, friendly, and concise (2-3 sentences max).
Don't mention that you're extracting information, just have a natural conversation.`;

      // Include any existing profile information for context
      const existingProfile = {
        ...extractedProfile,
        ...businessProfile
      };
      
      if (existingProfile.name || existingProfile.industry || existingProfile.size || existingProfile.founded) {
        systemPrompt += `\n\nEXISTING PROFILE INFORMATION:`;
        
        if (existingProfile.name) {
          systemPrompt += `\nBusiness Name: ${existingProfile.name}`;
        }
        
        if (existingProfile.industry) {
          systemPrompt += `\nIndustry: ${existingProfile.industry}`;
        }
        
        if (existingProfile.size) {
          systemPrompt += `\nSize: ${existingProfile.size}`;
        }
        
        if (existingProfile.founded) {
          systemPrompt += `\nFounded: ${existingProfile.founded}`;
        }
        
        systemPrompt += `\n\nUse this information for context but still confirm or collect missing details through natural conversation.`;
      }
      
      // Debug the prompt
      console.log('System prompt:', systemPrompt);
      
      // Get response from OpenAI
      const allMessages = [...messages, userMessage];
      const aiResponseText = await getLLMResponse(allMessages, systemPrompt);
      
      // Create AI response message
      const aiMessage: Message = {
        id: uuidv4(),
        text: aiResponseText || getFollowupQuestion(extractedProfile),
        sender: 'ai',
        timestamp: new Date()
      };
      
      // Add the AI message to the chat
      setIsTyping(false);
      setMessages(prev => [...prev, aiMessage]);
      
      // Extract information from all messages including the new AI response
      const updatedExtracted = extractBusinessInfo([...allMessages, aiMessage]);
      
      // For debugging - log what was extracted
      console.log('Extracted info:', updatedExtracted);
      
      // Update extracted profile with any new information
      setExtractedProfile(prev => ({ ...prev, ...updatedExtracted }));
      
      // If we have all required fields, suggest moving to the next step
      const hasAllRequiredFields = 
        !!updatedExtracted.name && 
        !!updatedExtracted.industry && 
        !!updatedExtracted.size && 
        !!updatedExtracted.founded;
      
      if (hasAllRequiredFields) {
        setIsTyping(true);
        setTimeout(() => {
          const completionMessage: Message = {
            id: uuidv4(),
            text: `Great! I now have a good understanding of ${updatedExtracted.name}. Click "Next" when you're ready to continue.`,
            sender: 'ai',
            timestamp: new Date()
          };
          
          setIsTyping(false);
          setMessages(prev => [...prev, completionMessage]);
          setAnimationProgress(75); // Almost complete
        }, 1000);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsTyping(false);
    }
  };
  
  // Check if we have enough information to proceed
  const hasRequiredInfo = !!businessProfile.name && 
                        !!businessProfile.industry && 
                        !!businessProfile.size && 
                        !!businessProfile.founded;
  
  return (
    <div className="flex flex-col w-full">
      <h2 className="text-2xl font-semibold text-pure-white mb-2">Business Profile</h2>
      <p className="text-soft-silver mb-6">Tell me about your business so I can customize your innovation journey.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
        {/* Chat interface */}
        <div className="md:col-span-2 bg-midnight-navy/50 rounded-lg border border-cosmic-slate/30 overflow-hidden shadow-lg">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
            placeholder="Tell me about your business..."
          />
        </div>
        
        {/* Visual representation */}
        <div className="flex flex-col bg-midnight-navy/50 rounded-lg border border-cosmic-slate/30 p-6 shadow-lg">
          <h3 className="text-pure-white font-medium text-center mb-4">Your Business DNA</h3>
          
          <div className="flex-grow flex items-center justify-center">
            <BusinessDNAAnimation progress={animationProgress} />
          </div>
          
          {/* Extracted information summary */}
          <div className="mt-4 space-y-2">
            <div className="flex">
              <span className="w-24 text-ghost-gray">Name:</span>
              <span className="text-pure-white font-medium">{businessProfile.name || '...'}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-ghost-gray">Industry:</span>
              <span className="text-pure-white font-medium">{businessProfile.industry || '...'}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-ghost-gray">Size:</span>
              <span className="text-pure-white font-medium">{businessProfile.size || '...'}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-ghost-gray">Founded:</span>
              <span className="text-pure-white font-medium">{businessProfile.founded || '...'}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="btn btn-secondary"
          >
            Back
          </button>
        )}
        <div className="ml-auto">
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
    </div>
  );
};

export default ChatBasedProfileStep; 