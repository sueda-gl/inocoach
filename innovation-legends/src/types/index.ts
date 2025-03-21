export interface BusinessDNASegment {
  id: string;
  name: string;
  category: 'operations' | 'finance' | 'marketing' | 'innovation';
  strength: number; // 0-100
  description: string;
  insights: string[];
}

export interface ProfileSection {
  id: string;
  name: string;
  isComplete: boolean;
  weight: number;
}

export interface BusinessProfile {
  id: string;
  name: string;
  industry: string;
  size: string;
  founded: number;
  challenges: string[];
  goals: string[];
  innovationReadiness: number;
  dnaSegments: BusinessDNASegment[];
  profileCompletion?: number; // Percentage of profile completed
  incompleteSections?: ProfileSection[]; // Sections that need to be completed
  documentData?: {
    count: number;
    types: string[];
  };
  innovationPersona?: InnovationPersona; // Added innovation persona classification
}

export interface Coach {
  id: string;
  name: string;
  title: string;
  expertise: string[];
  avatarUrl: string;
  accentColor: string;
  approach: string;
  riskAppetite: number; // 0-100
  timeHorizon: number; // 0-100
  resourceIntensity: number; // 0-100
  description: string;
}

export interface BusinessMetrics {
  revenue: number;
  profit: number;
  customerSatisfaction: number;
  marketShare: number;
  employeeEngagement: number;
  innovationIndex: number;
}

export interface ImplementedIdea {
  id: string;
  title: string;
  description: string;
  impact: {
    revenue: number;
    profit: number;
    customerSatisfaction: number;
    marketShare: number;
    employeeEngagement: number;
    innovationIndex: number;
  };
  implementationDate: Date;
  coachId: string;
}

export interface BusinessSimulation {
  currentMetrics: BusinessMetrics;
  oneYearProjection: BusinessMetrics;
  twoYearProjection: BusinessMetrics;
  implementedIdeas: ImplementedIdea[];
}

export interface IdeaSuggestion {
  title: string;
  description: string;
  impact: {
    revenue: number;
    profit: number;
    customerSatisfaction: number;
    marketShare: number;
    employeeEngagement: number;
    innovationIndex: number;
  };
}

export interface Message {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: Date;
  suggestions?: IdeaSuggestion[];
}

// Define innovation persona types
export type InnovationPersonaType = 'clueless' | 'motivated' | 'hesitant';

export interface InnovationPersona {
  type: InnovationPersonaType;
  confidence: 'high' | 'medium' | 'low';
  explanation: string;
} 