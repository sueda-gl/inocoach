import { createContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Coach, Message } from '../types';

// Mock data for coaches - in a real app this would come from an API
const mockCoaches: Coach[] = [
  {
    id: 'coach-1',
    name: 'Dr. Eliza Morgan',
    title: 'Innovation Strategist',
    expertise: ['Disruptive Innovation', 'Design Thinking', 'Digital Transformation'],
    avatarUrl: '/coaches/coach1.jpg',
    accentColor: '#2D7FF9', // electric-blue
    approach: 'Analytical and methodical, focuses on long-term strategic innovation',
    riskAppetite: 60,
    timeHorizon: 80,
    resourceIntensity: 40,
    description: 'Dr. Morgan helps businesses create sustainable innovation frameworks that transform organizational culture while driving measurable results.'
  },
  {
    id: 'coach-2',
    name: 'Marcus Chen',
    title: 'Rapid Growth Specialist',
    expertise: ['Market Expansion', 'Lean Startup', 'Growth Hacking'],
    avatarUrl: '/coaches/coach2.jpg',
    accentColor: '#05D8C6', // teal-pulse
    approach: 'Agile and experimental, focuses on rapid iterations and customer feedback',
    riskAppetite: 80,
    timeHorizon: 30,
    resourceIntensity: 20,
    description: 'Marcus specializes in helping businesses achieve breakthrough growth through rapid experimentation and data-driven decision making.'
  },
  {
    id: 'coach-3',
    name: 'Sofia Patel',
    title: 'Creative Disruption Expert',
    expertise: ['Creative Problem Solving', 'Business Model Innovation', 'Industry Disruption'],
    avatarUrl: '/coaches/coach3.jpg',
    accentColor: '#9D5CFF', // amethyst
    approach: 'Creative and visionary, focuses on breakthrough innovations and new paradigms',
    riskAppetite: 90,
    timeHorizon: 70,
    resourceIntensity: 60,
    description: 'Sofia guides companies to reimagine their business models and create disruptive innovations that transform industries and create new market space.'
  },
  {
    id: 'coach-4',
    name: 'James Rivera',
    title: 'Tech Innovation Advisor',
    expertise: ['Emerging Technologies', 'AI Implementation', 'Digital Products'],
    avatarUrl: '/coaches/coach4.jpg',
    accentColor: '#FF6B6B', // coral-energy
    approach: 'Technology-focused, helps businesses leverage cutting-edge tech for innovation',
    riskAppetite: 75,
    timeHorizon: 50,
    resourceIntensity: 70,
    description: 'James specializes in helping businesses identify and implement emerging technologies to create competitive advantages and new revenue streams.'
  },
  {
    id: 'coach-5',
    name: 'Amara Johnson',
    title: 'Sustainable Innovation Lead',
    expertise: ['Green Business Models', 'Circular Economy', 'ESG Strategy'],
    avatarUrl: '/coaches/coach5.jpg',
    accentColor: '#4CAF50', // green
    approach: 'Sustainability-driven, focuses on environmentally responsible innovation',
    riskAppetite: 40,
    timeHorizon: 90,
    resourceIntensity: 50,
    description: 'Amara helps businesses develop sustainable innovation strategies that balance profit with environmental and social responsibility.'
  },
  {
    id: 'coach-6',
    name: 'David Kim',
    title: 'Corporate Innovation Expert',
    expertise: ['Intrapreneurship', 'Innovation Labs', 'Change Management'],
    avatarUrl: '/coaches/coach6.jpg',
    accentColor: '#FF9800', // orange
    approach: 'Structured yet flexible, specializes in driving innovation within established organizations',
    riskAppetite: 50,
    timeHorizon: 60,
    resourceIntensity: 80,
    description: 'David specializes in helping large organizations establish effective innovation programs that overcome bureaucracy and drive meaningful change.'
  },
  {
    id: 'coach-7',
    name: 'Mei Zhang',
    title: 'Global Innovation Strategist',
    expertise: ['International Expansion', 'Cross-Cultural Innovation', 'Global Markets'],
    avatarUrl: '/coaches/coach7.jpg',
    accentColor: '#E91E63', // pink
    approach: 'Globally-minded, helps businesses innovate across cultural and geographic boundaries',
    riskAppetite: 70,
    timeHorizon: 75,
    resourceIntensity: 65,
    description: 'Mei guides companies in developing and implementing innovation strategies that succeed across different markets and cultural contexts.'
  }
];

interface CoachSession {
  coachId: string;
  messages: Message[];
}

interface CoachContextType {
  coaches: Coach[];
  selectedCoach: Coach | null;
  selectCoach: (coachId: string) => void;
  sessions: Record<string, CoachSession>;
  currentSession: CoachSession | null;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
}

export const CoachContext = createContext<CoachContextType | undefined>(undefined);

interface CoachProviderProps {
  children: ReactNode;
}

export const CoachProvider = ({ children }: CoachProviderProps) => {
  const [coaches] = useState<Coach[]>(mockCoaches);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [sessions, setSessions] = useState<Record<string, CoachSession>>({});
  const [currentSession, setCurrentSession] = useState<CoachSession | null>(null);
  
  // Use a ref to track the latest messages to prevent race conditions
  const latestMessagesRef = useRef<Record<string, Message[]>>({});
  
  // Debug coaches array
  console.log('CoachProvider - coaches array:', coaches.length, coaches.map(c => c.name));
  
  // Load sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('coachSessions');
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions);
      setSessions(parsedSessions);
      
      // Initialize the latestMessagesRef with saved session messages
      Object.entries(parsedSessions).forEach(([coachId, session]) => {
        latestMessagesRef.current[coachId] = [...(session as CoachSession).messages];
      });
    }
  }, []);
  
  // Save sessions to localStorage when they change
  useEffect(() => {
    if (Object.keys(sessions).length > 0) {
      localStorage.setItem('coachSessions', JSON.stringify(sessions));
    }
  }, [sessions]);
  
  // Set current session when selected coach changes
  useEffect(() => {
    if (selectedCoach) {
      const existingSession = sessions[selectedCoach.id];
      
      if (existingSession) {
        setCurrentSession(existingSession);
        
        // Initialize latestMessagesRef for this coach if needed
        if (!latestMessagesRef.current[selectedCoach.id]) {
          latestMessagesRef.current[selectedCoach.id] = [...existingSession.messages];
        }
      } else {
        const newSession: CoachSession = {
          coachId: selectedCoach.id,
          messages: []
        };
        
        setSessions(prev => ({
          ...prev,
          [selectedCoach.id]: newSession
        }));
        
        setCurrentSession(newSession);
        latestMessagesRef.current[selectedCoach.id] = [];
      }
    } else {
      setCurrentSession(null);
    }
  }, [selectedCoach, sessions]);
  
  const selectCoach = (coachId: string) => {
    const coach = coaches.find(c => c.id === coachId) || null;
    setSelectedCoach(coach);
  };
  
  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    if (!selectedCoach) {
      console.error('Cannot add message: No coach selected');
      return;
    }
    
    const coachId = selectedCoach.id;
    
    // Create the new message with ID and timestamp
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date()
    };
    
    console.log(`Adding ${message.sender} message:`, message.text.substring(0, 30));
    
    // Get the latest messages for this coach from our ref
    // This ensures we always have the most up-to-date messages
    const currentMessages = latestMessagesRef.current[coachId] || [];
    
    // Add the new message to our messages array
    const updatedMessages = [...currentMessages, newMessage];
    
    // Immediately update our ref to ensure latest state
    latestMessagesRef.current[coachId] = updatedMessages;
    
    // Create updated session
    const updatedSession: CoachSession = {
      coachId,
      messages: updatedMessages
    };
    
    // Log message counts for debugging
    console.log(`Message counts - Before: ${currentMessages.length}, After: ${updatedMessages.length}`);
    console.log('All messages after update:', updatedMessages.map(m => 
      `${m.sender}: ${m.text.substring(0, 20)}...`));
    
    // Update both state variables synchronously
    setSessions(prev => {
      const newSessions = {
        ...prev,
        [coachId]: updatedSession
      };
      return newSessions;
    });
    
    // Set current session separately
    setCurrentSession(updatedSession);
  };
  
  return (
    <CoachContext.Provider value={{
      coaches,
      selectedCoach,
      selectCoach,
      sessions,
      currentSession,
      addMessage
    }}>
      {children}
    </CoachContext.Provider>
  );
}; 