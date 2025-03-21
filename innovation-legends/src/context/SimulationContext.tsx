import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { BusinessSimulation, BusinessMetrics, ImplementedIdea } from '../types';
import { BusinessContext } from './BusinessContext';

const initialMetrics: BusinessMetrics = {
  revenue: 100, // Base value 100
  profit: 10,  // Base value 10
  customerSatisfaction: 70, // Base value 70
  marketShare: 5, // Base value 5
  employeeEngagement: 60, // Base value 60
  innovationIndex: 40 // Base value 40
};

interface SimulationContextType {
  simulation: BusinessSimulation;
  implementIdea: (idea: Omit<ImplementedIdea, 'id' | 'implementationDate'>) => void;
  resetSimulation: () => void;
  setSimulation: (value: React.SetStateAction<BusinessSimulation>) => void;
}

export const SimulationContext = createContext<SimulationContextType>({
  simulation: {
    currentMetrics: initialMetrics,
    oneYearProjection: initialMetrics,
    twoYearProjection: initialMetrics,
    implementedIdeas: []
  },
  implementIdea: () => {},
  resetSimulation: () => {},
  setSimulation: () => {}
});

interface SimulationProviderProps {
  children: ReactNode;
}

export const SimulationProvider = ({ children }: SimulationProviderProps) => {
  const businessContext = useContext(BusinessContext);
  const [simulation, setSimulation] = useState<BusinessSimulation>({
    currentMetrics: initialMetrics,
    oneYearProjection: initialMetrics,
    twoYearProjection: initialMetrics,
    implementedIdeas: []
  });
  
  // Load simulation from localStorage
  useEffect(() => {
    const savedSimulation = localStorage.getItem('businessSimulation');
    if (savedSimulation) {
      const parsedSimulation = JSON.parse(savedSimulation);
      
      // Convert string dates back to Date objects
      const updatedImplementedIdeas = parsedSimulation.implementedIdeas.map((idea: any) => ({
        ...idea,
        implementationDate: new Date(idea.implementationDate)
      }));
      
      setSimulation({
        ...parsedSimulation,
        implementedIdeas: updatedImplementedIdeas
      });
    }
  }, []);
  
  // Save simulation to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('businessSimulation', JSON.stringify(simulation));
  }, [simulation]);
  
  // Recalculate projections when business profile changes or ideas are implemented
  useEffect(() => {
    if (!businessContext?.businessProfile) return;
    
    calculateProjections();
  }, [businessContext?.businessProfile, simulation.implementedIdeas]);
  
  const calculateProjections = () => {
    if (!businessContext?.businessProfile) return;
    
    // Get base metrics
    const baseMetrics = { ...simulation.currentMetrics };
    
    // Apply business profile factors to base metrics
    const profile = businessContext.businessProfile;
    const innovationReadiness = profile.innovationReadiness / 100; // Convert to 0-1 scale
    
    baseMetrics.innovationIndex = Math.round(baseMetrics.innovationIndex * (1 + innovationReadiness * 0.3)); // Adjust innovation index
    
    // Calculate impact of implemented ideas
    const implementedIdeas = simulation.implementedIdeas;
    
    // Simple algorithm for calculating the aggregate impact of ideas
    // In a real system, this would be much more sophisticated
    const oneYearImpact = calculateAggregateImpact(implementedIdeas, 1);
    const twoYearImpact = calculateAggregateImpact(implementedIdeas, 2);
    
    // Apply impacts to projections
    const oneYearProjection = applyImpactToMetrics(baseMetrics, oneYearImpact);
    const twoYearProjection = applyImpactToMetrics(baseMetrics, twoYearImpact);
    
    setSimulation(prev => ({
      ...prev,
      oneYearProjection,
      twoYearProjection
    }));
  };
  
  const calculateAggregateImpact = (ideas: ImplementedIdea[], yearHorizon: number): Partial<BusinessMetrics> => {
    // Simple impact model, assumes compounding effects over time
    const impact: Partial<BusinessMetrics> = {
      revenue: 0,
      profit: 0,
      customerSatisfaction: 0,
      marketShare: 0,
      employeeEngagement: 0,
      innovationIndex: 0
    };
    
    ideas.forEach(idea => {
      const multiplier = yearHorizon === 1 ? 1 : 1.8; // Ideas have more impact in year 2
      
      Object.keys(idea.impact).forEach(key => {
        const metricKey = key as keyof BusinessMetrics;
        impact[metricKey] = (impact[metricKey] || 0) + (idea.impact[metricKey] * multiplier);
      });
    });
    
    return impact;
  };
  
  const applyImpactToMetrics = (baseMetrics: BusinessMetrics, impact: Partial<BusinessMetrics>): BusinessMetrics => {
    const result = { ...baseMetrics };
    
    Object.keys(impact).forEach(key => {
      const metricKey = key as keyof BusinessMetrics;
      result[metricKey] += impact[metricKey] || 0;
    });
    
    return result;
  };
  
  const implementIdea = (idea: Omit<ImplementedIdea, 'id' | 'implementationDate'>) => {
    const newIdea: ImplementedIdea = {
      ...idea,
      id: `idea-${Date.now()}`,
      implementationDate: new Date()
    };
    
    setSimulation(prev => ({
      ...prev,
      implementedIdeas: [...prev.implementedIdeas, newIdea]
    }));
  };
  
  const resetSimulation = () => {
    setSimulation({
      currentMetrics: initialMetrics,
      oneYearProjection: initialMetrics,
      twoYearProjection: initialMetrics,
      implementedIdeas: []
    });
    
    localStorage.removeItem('businessSimulation');
  };
  
  return (
    <SimulationContext.Provider value={{
      simulation,
      implementIdea,
      resetSimulation,
      setSimulation
    }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}; 