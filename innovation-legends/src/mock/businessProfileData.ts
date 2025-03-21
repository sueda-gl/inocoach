import { BusinessProfile, BusinessDNASegment } from '../types';

// Mock DNA Segments with enhanced data
export const mockDNASegments: BusinessDNASegment[] = [
  {
    id: "ops-efficiency",
    name: "Process Optimization",
    category: "operations",
    strength: 72,
    description: "Your ability to streamline workflows and optimize resource allocation across departments.",
    insights: [
      "Your project management methodologies show strong implementation.",
      "Consider adopting more agile approaches in non-technical departments.",
      "Supply chain efficiency is in the top quartile for your industry."
    ]
  },
  {
    id: "financial-health",
    name: "Capital Structure",
    category: "finance",
    strength: 63,
    description: "Your organization's funding mix, investment strategy, and cash flow management.",
    insights: [
      "Your debt-to-equity ratio is well-optimized for growth.",
      "Consider allocating more resources to emerging technology investments.",
      "Cash reserves are sufficient but could be more strategically deployed."
    ]
  },
  {
    id: "market-presence",
    name: "Brand Positioning",
    category: "marketing",
    strength: 89,
    description: "Your market differentiation, brand perception, and competitive positioning.",
    insights: [
      "Your brand enjoys exceptional recognition within your target demographic.",
      "Social media engagement metrics exceed industry benchmarks by 34%.",
      "Consider expanding your thought leadership content strategy."
    ]
  },
  {
    id: "innovation-mindset",
    name: "Creative Culture",
    category: "innovation",
    strength: 47,
    description: "Your organization's creativity, experimentation mindset, and innovation processes.",
    insights: [
      "Employees report barriers to proposing unconventional solutions.",
      "Innovation metrics are inconsistently applied across departments.",
      "Consider implementing dedicated innovation sprints quarterly."
    ]
  },
  {
    id: "talent-development",
    name: "Talent Ecosystem",
    category: "operations",
    strength: 81,
    description: "Your ability to attract, develop, and retain high-performing talent.",
    insights: [
      "Your employee retention rate is 31% above industry average.",
      "Training programs show excellent knowledge transfer effectiveness.",
      "Consider expanding cross-functional development opportunities."
    ]
  },
  {
    id: "digital-transformation",
    name: "Digital Maturity",
    category: "innovation",
    strength: 58,
    description: "Your organization's adoption of digital technologies and data-driven decision making.",
    insights: [
      "Your data analytics capabilities are developing but underutilized.",
      "Digital tool adoption varies significantly between departments.",
      "Consider implementing a more cohesive digital transformation roadmap."
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
  name: "NexGen Innovations",
  industry: "Advanced Manufacturing & IoT",
  size: "120-350 employees",
  founded: 2011,
  challenges: [
    "Integrating AI into manufacturing processes",
    "Talent acquisition in a competitive market",
    "Responding to rapid technological changes in the industry"
  ],
  goals: [
    "Reduce production costs by 22% through automation",
    "Launch 3 IoT-enabled product lines by next fiscal year",
    "Achieve carbon-neutral operations by 2025"
  ],
  innovationReadiness: 73,
  dnaSegments: mockDNASegments,
  profileCompletion: calculateProfileCompletion(),
  incompleteSections: profileSections.filter(section => !section.isComplete)
}; 