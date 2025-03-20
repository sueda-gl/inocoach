import { useContext } from 'react';
import { CoachContext } from '../context/CoachContext';

export const useCoach = () => {
  const context = useContext(CoachContext);
  
  if (context === undefined) {
    throw new Error('useCoach must be used within a CoachProvider');
  }
  
  return context;
}; 