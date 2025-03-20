import { BusinessProfile, BusinessDNASegment } from '../types';

// Mock DNA Segments with enhanced data
export const mockDNASegments: BusinessDNASegment[] = [
  {
    id: "ops-efficiency",
    name: "Operational Efficiency",
    category: "operations",
    strength: 65,
    description: "How efficiently your business operates, including processes, systems, and resource utilization.",
    insights: [
      "Your operational processes could benefit from additional automation.",
      "Consider implementing lean management principles to reduce waste.",
      "Your team structure shows good alignment with business goals."
    ]
  },
  {
    id: "financial-health",
    name: "Financial Resources",
    category: "finance",
    strength: 78,
    description: "Your business's financial health, including cash flow, investment capacity, and financial planning.",
    insights: [
      "Strong cash reserves provide stability for innovation initiatives.",
      "Consider diversifying revenue streams to reduce market dependency.",
      "Your investment in R&D is above industry average."
    ]
  },
  {
    id: "market-presence",
    name: "Market Awareness",
    category: "marketing",
    strength: 42,
    description: "Your business's market knowledge, brand recognition, and customer insights.",
    insights: [
      "Your competitive analysis could be more comprehensive.",
      "Customer feedback systems need strengthening.",
      "Consider more targeted marketing campaigns based on demographic data."
    ]
  },
  {
    id: "innovation-mindset",
    name: "Innovation Culture",
    category: "innovation",
    strength: 55,
    description: "Your organization's innovation mindset, risk tolerance, and creative problem-solving capabilities.",
    insights: [
      "Employees report moderate comfort with taking calculated risks.",
      "Brainstorming sessions produce good ideas but implementation is slow.",
      "Consider creating dedicated innovation time for all employees."
    ]
  }
];

// Profile sections and their completion status
export const profileSections = [
  { id: "basic-info", name: "Basic Information", isComplete: true, weight: 15 },
  { id: "business-model", name: "Business Model", isComplete: true, weight: 20 },
  { id: "financial-data", name: "Financial Data", isComplete: true, weight: 15 },
  { id: "team-structure", name: "Team Structure", isComplete: false, weight: 10 },
  { id: "market-research", name: "Market Research", isComplete: false, weight: 15 },
  { id: "competitors", name: "Competitors", isComplete: true, weight: 10 },
  { id: "innovation-history", name: "Innovation History", isComplete: false, weight: 15 }
];

// Calculate profile completion percentage
const calculateProfileCompletion = () => {
  const completedWeight = profileSections
    .filter(section => section.isComplete)
    .reduce((sum, section) => sum + section.weight, 0);
  
  const totalWeight = profileSections.reduce((sum, section) => sum + section.weight, 0);
  
  return Math.round((completedWeight / totalWeight) * 100);
};

// Enhanced mock business profile with completion data
export const mockBusinessProfile: BusinessProfile = {
  id: "bp-12345",
  name: "TechNova Solutions",
  industry: "Software & Technology",
  size: "50-200 employees",
  founded: 2015,
  challenges: [
    "Scaling development team while maintaining quality",
    "Entering new international markets",
    "Balancing innovation with maintaining existing products"
  ],
  goals: [
    "Increase customer retention by 15% in the next year",
    "Launch two new product features per quarter",
    "Establish presence in Asian markets by Q4"
  ],
  innovationReadiness: 68,
  dnaSegments: mockDNASegments,
  profileCompletion: calculateProfileCompletion(),
  incompleteSections: profileSections.filter(section => !section.isComplete)
}; 