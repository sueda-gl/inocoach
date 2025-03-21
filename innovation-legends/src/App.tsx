import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { BusinessProvider } from './context/BusinessContext';
import { CoachProvider } from './context/CoachContext';
import { SimulationProvider } from './context/SimulationContext';
import { useBusinessProfile } from './hooks/useBusinessProfile';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import SandboxPage from './pages/SandboxPage';
import { motion, AnimatePresence } from 'framer-motion';

// Navigation bar shown after onboarding
const NavigationBar = () => {
  const location = useLocation();
  const { businessProfile, clearBusinessProfile } = useBusinessProfile();
  
  // Don't show on onboarding page
  if (location.pathname === '/onboarding') return null;
  
  const resetOnboarding = () => {
    if (window.confirm('This will reset your onboarding process. Continue?')) {
      clearBusinessProfile();
      window.location.href = '/onboarding';
    }
  };
  
  return (
    <motion.header 
      className="bg-midnight-navy border-b border-cosmic-slate"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/dashboard" className="text-xl font-bold text-pure-white">Innovation Legends</Link>
          {businessProfile && (
            <div className="ml-6 text-ghost-gray">
              <span className="text-soft-silver">{businessProfile.name}</span>
              <span className="mx-2">|</span>
              <span>{businessProfile.industry}</span>
            </div>
          )}
        </div>
        
        <nav className="flex items-center">
          <ul className="flex space-x-6">
            <li>
              <Link 
                to="/dashboard" 
                className={`transition-colors ${location.pathname === '/dashboard' 
                  ? 'text-electric-blue font-medium' 
                  : 'text-ghost-gray hover:text-soft-silver'}`}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to={location.pathname.includes('/sandbox') ? location.pathname : '/dashboard'} 
                className={`transition-colors ${location.pathname.includes('/sandbox') 
                  ? 'text-electric-blue font-medium' 
                  : 'text-ghost-gray hover:text-soft-silver'}`}
              >
                Sandbox
              </Link>
            </li>
            <li>
              <button
                onClick={resetOnboarding}
                className="text-ghost-gray hover:text-coral-energy text-sm ml-6"
              >
                Reset Onboarding
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </motion.header>
  );
};

// Page transition wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Protected route component to redirect if not onboarded
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isOnboardingComplete, businessProfile } = useBusinessProfile();
  
  // Use the same strict check as in AppRoutes
  const isOnboardingDone = isOnboardingComplete && 
                          businessProfile && 
                          businessProfile.name && 
                          businessProfile.industry && 
                          businessProfile.size;
  
  if (!isOnboardingDone) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  const { isOnboardingComplete, businessProfile } = useBusinessProfile();
  const location = useLocation();
  
  // Only consider onboarding done if both flags are true AND business profile exists with essential data
  const isOnboardingDone = isOnboardingComplete && 
                          businessProfile && 
                          businessProfile.name && 
                          businessProfile.industry && 
                          businessProfile.size;
  
  // For debugging
  console.log('isOnboardingComplete:', isOnboardingComplete);
  console.log('businessProfile exists:', !!businessProfile);
  console.log('isOnboardingDone:', isOnboardingDone);
  
  return (
    <>
      <NavigationBar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/onboarding" element={
            isOnboardingDone ? <Navigate to="/dashboard" replace /> : 
            <PageTransition><OnboardingPage /></PageTransition>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <PageTransition><DashboardPage /></PageTransition>
            </ProtectedRoute>
          } />
          <Route path="/sandbox/:coachId" element={
            <ProtectedRoute>
              <PageTransition><SandboxPage /></PageTransition>
            </ProtectedRoute>
          } />
          <Route path="/" element={
            isOnboardingDone ? <Navigate to="/dashboard" replace /> : <Navigate to="/onboarding" replace />
          } />
        </Routes>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <Router>
      <BusinessProvider>
        <CoachProvider>
          <SimulationProvider>
            <div className="min-h-screen bg-deep-space text-soft-silver">
              <AppRoutes />
            </div>
          </SimulationProvider>
        </CoachProvider>
      </BusinessProvider>
    </Router>
  );
}

export default App;
