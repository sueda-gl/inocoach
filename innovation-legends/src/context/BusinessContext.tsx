import { createContext, useState, useEffect, ReactNode } from 'react';
import { BusinessProfile, BusinessDNASegment, ProfileSection } from '../types';
import { mockBusinessProfile } from '../mock/businessProfileData';

interface BusinessContextType {
  businessProfile: BusinessProfile | null;
  updateBusinessProfile: (updates: Partial<BusinessProfile>) => Promise<void>;
  updateDNASegment: (segmentId: string, updates: Partial<BusinessDNASegment>) => void;
  addDNASegment: (segment: BusinessDNASegment) => void;
  removeDNASegment: (segmentId: string) => void;
  clearBusinessProfile: () => void;
  isOnboardingComplete: boolean;
  updateProfileSection: (sectionId: string, isComplete: boolean) => void;
  addProfileData: (sectionId: string, data: any) => Promise<void>;
}

export const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

interface BusinessProviderProps {
  children: ReactNode;
}

export const BusinessProvider = ({ children }: BusinessProviderProps) => {
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean>(false);
  
  // Load from localStorage on initial render
  useEffect(() => {
    // For testing: Uncomment this line to clear localStorage and force onboarding
    localStorage.removeItem('businessProfile');
    
    const savedProfile = localStorage.getItem('businessProfile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        
        // Only consider onboarding complete if we have all required fields
        if (parsedProfile.name && parsedProfile.industry && parsedProfile.size) {
          setBusinessProfile(parsedProfile);
          setIsOnboardingComplete(true);
        } else {
          // If the profile is incomplete, clear it and start fresh
          localStorage.removeItem('businessProfile');
          setIsOnboardingComplete(false);
        }
      } catch (error) {
        console.error('Error parsing saved profile:', error);
        localStorage.removeItem('businessProfile');
        setIsOnboardingComplete(false);
      }
    }
  }, []);
  
  // Save to localStorage when profile changes
  useEffect(() => {
    if (businessProfile) {
      // Only if we have a valid businessProfile with required fields
      if (businessProfile.name && businessProfile.industry && businessProfile.size) {
        localStorage.setItem('businessProfile', JSON.stringify(businessProfile));
        // Explicitly set the onboarding flag to true
        setIsOnboardingComplete(true);
      }
    } else {
      localStorage.removeItem('businessProfile');
      setIsOnboardingComplete(false);
    }
  }, [businessProfile]);
  
  const updateBusinessProfile = (updates: Partial<BusinessProfile>) => {
    // Convert to Promise-based update
    return new Promise<void>((resolve) => {
      setBusinessProfile(prev => {
        const updated = prev ? { ...prev, ...updates } : updates as BusinessProfile;
        // Use setTimeout to ensure state has time to update
        setTimeout(() => {
          resolve();
        }, 100);
        return updated;
      });
    });
  };
  
  const updateDNASegment = (segmentId: string, updates: Partial<BusinessDNASegment>) => {
    setBusinessProfile(prev => {
      if (!prev) return null;
      
      const updatedSegments = prev.dnaSegments.map(segment => 
        segment.id === segmentId ? { ...segment, ...updates } : segment
      );
      
      return {
        ...prev,
        dnaSegments: updatedSegments
      };
    });
  };
  
  const addDNASegment = (segment: BusinessDNASegment) => {
    setBusinessProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        dnaSegments: [...prev.dnaSegments, segment]
      };
    });
  };
  
  const removeDNASegment = (segmentId: string) => {
    setBusinessProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        dnaSegments: prev.dnaSegments.filter(segment => segment.id !== segmentId)
      };
    });
  };
  
  const clearBusinessProfile = () => {
    setBusinessProfile(null);
    localStorage.removeItem('businessProfile');
  };
  
  // Calculate profile completion percentage
  const calculateProfileCompletion = (profile: BusinessProfile) => {
    if (!profile.incompleteSections) return 100;
    
    const incompleteSectionsWeight = profile.incompleteSections.reduce(
      (sum, section) => sum + section.weight, 0
    );
    
    // Assuming total weight is 100
    const totalWeight = 100;
    const completedWeight = totalWeight - incompleteSectionsWeight;
    
    return Math.round((completedWeight / totalWeight) * 100);
  };
  
  // Update a profile section's completion status
  const updateProfileSection = (sectionId: string, isComplete: boolean) => {
    setBusinessProfile(prev => {
      if (!prev || !prev.incompleteSections) return prev;
      
      let updatedIncompleteSections: ProfileSection[];
      
      if (isComplete) {
        // If section is complete, remove it from incompleteSections
        updatedIncompleteSections = prev.incompleteSections.filter(
          section => section.id !== sectionId
        );
      } else {
        // If section is incomplete and not already in incompleteSections, add it
        const existingSection = prev.incompleteSections.find(s => s.id === sectionId);
        if (existingSection) {
          updatedIncompleteSections = [...prev.incompleteSections];
        } else {
          // Find the section in the mock data to get its weight and name
          const sectionFromMock = mockBusinessProfile.incompleteSections?.find(
            s => s.id === sectionId
          ) || { id: sectionId, name: sectionId, weight: 10, isComplete: false };
          
          updatedIncompleteSections = [...prev.incompleteSections, { ...sectionFromMock, isComplete: false }];
        }
      }
      
      const updatedProfile = {
        ...prev,
        incompleteSections: updatedIncompleteSections
      };
      
      // Recalculate profile completion
      updatedProfile.profileCompletion = calculateProfileCompletion(updatedProfile);
      
      return updatedProfile;
    });
  };
  
  // Add data to a specific section of the profile
  const addProfileData = (sectionId: string, data: any) => {
    return new Promise<void>((resolve) => {
      // Update the business profile with new data
      setBusinessProfile(prev => {
        if (!prev) return null;
        
        // Mark the section as complete
        updateProfileSection(sectionId, true);
        
        // Add the data to the profile (would be section-specific in a real implementation)
        const updatedProfile = { ...prev, ...data };
        
        setTimeout(() => {
          resolve();
        }, 100);
        
        return updatedProfile;
      });
    });
  };
  
  return (
    <BusinessContext.Provider value={{ 
      businessProfile, 
      updateBusinessProfile,
      updateDNASegment,
      addDNASegment,
      removeDNASegment,
      clearBusinessProfile,
      isOnboardingComplete,
      updateProfileSection,
      addProfileData
    }}>
      {children}
    </BusinessContext.Provider>
  );
}; 