import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBusinessProfile } from '../hooks/useBusinessProfile';
import { useTheme } from '../context/ThemeContext';

const NavigationBar = () => {
  const location = useLocation();
  const { businessProfile } = useBusinessProfile();
  const { mode, toggleTheme } = useTheme();
  
  return (
    <motion.header 
      className="border-b transition-colors dark:bg-midnight-navy dark:border-cosmic-slate light:bg-white light:border-light-accent"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/dashboard" className="text-xl font-bold transition-colors dark:text-pure-white light:text-dark-text">Innovation Legends</Link>
          {businessProfile && (
            <div className="ml-6 transition-colors dark:text-ghost-gray light:text-light-text">
              <span className="transition-colors dark:text-soft-silver light:text-medium-text">{businessProfile.name}</span>
              <span className="mx-2">|</span>
              <span>{businessProfile.industry}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center">
          <nav className="mr-4">
            <ul className="flex space-x-6">
              <li>
                <Link 
                  to="/dashboard" 
                  className={`transition-colors ${location.pathname === '/dashboard' 
                    ? 'text-electric-blue font-medium' 
                    : 'dark:text-ghost-gray dark:hover:text-soft-silver light:text-medium-text light:hover:text-dark-text'}`}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to={location.pathname.includes('/sandbox') ? location.pathname : '/dashboard'} 
                  className={`transition-colors ${location.pathname.includes('/sandbox') 
                    ? 'text-electric-blue font-medium' 
                    : 'dark:text-ghost-gray dark:hover:text-soft-silver light:text-medium-text light:hover:text-dark-text'}`}
                >
                  Sandbox
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full transition-colors dark:bg-cosmic-slate dark:hover:bg-cosmic-slate/70 light:bg-light-accent light:hover:bg-gray-200"
            aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
          >
            {mode === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pure-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-dark-text" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default NavigationBar; 