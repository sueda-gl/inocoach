import { useContext } from 'react';
import { BusinessContext } from '../context/BusinessContext';

export const useBusinessProfile = () => {
  const context = useContext(BusinessContext);
  
  if (context === undefined) {
    throw new Error('useBusinessProfile must be used within a BusinessProvider');
  }
  
  return context;
}; 