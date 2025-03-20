import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessProfile } from '../hooks/useBusinessProfile';
import { useCoach } from '../hooks/useCoach';
import { BusinessDNASegment, Coach, ProfileSection } from '../types';
import { motion } from 'framer-motion';

// Placeholder components - these would be separated into component files in a full implementation
const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-deep-space p-4 md:p-8">
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

// Redesigned Business DNA Visualization Component
const BusinessDNASection = ({ dnaSegments }: { dnaSegments: BusinessDNASegment[] }) => {
  const [selectedSegment, setSelectedSegment] = useState<BusinessDNASegment | null>(null);
  const { businessProfile, updateProfileSection, addProfileData } = useBusinessProfile();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadSection, setUploadSection] = useState<ProfileSection | null>(null);
  const [uploadData, setUploadData] = useState<string>('');
  
  // Category styling configurations
  const categoryColors = {
    operations: 'border-teal-pulse text-teal-pulse',
    finance: 'border-electric-blue text-electric-blue',
    marketing: 'border-coral-energy text-coral-energy',
    innovation: 'border-amethyst text-amethyst'
  };
  
  const categoryBg = {
    operations: 'bg-teal-pulse/10',
    finance: 'bg-electric-blue/10',
    marketing: 'bg-coral-energy/10',
    innovation: 'bg-amethyst/10'
  };
  
  const categoryGradients = {
    operations: 'from-teal-pulse/70 to-teal-pulse/10',
    finance: 'from-electric-blue/70 to-electric-blue/10',
    marketing: 'from-coral-energy/70 to-coral-energy/10',
    innovation: 'from-amethyst/70 to-amethyst/10'
  };
  
  const categoryIcons = {
    operations: '⚙️',
    finance: '💰',
    marketing: '📊',
    innovation: '💡'
  };
  
  // Handle form submission
  const handleUploadSubmit = () => {
    if (!uploadSection) return;
    
    addProfileData(uploadSection.id, { additionalData: uploadData }).then(() => {
      setShowUploadForm(false);
      setUploadData('');
      setUploadSection(null);
    });
  };
  
  return (
    <section className="card mb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-pure-white">Business DNA</h2>
          <p className="text-ghost-gray">
            Your unique business profile visualized as interconnected capabilities.
            Click on any segment to see more details.
          </p>
        </div>
        
        {/* Profile Completion Meter */}
        {businessProfile?.profileCompletion !== undefined && (
          <div className="mt-4 md:mt-0 bg-midnight-navy rounded-lg w-full md:w-auto min-w-[240px] overflow-hidden shadow-lg border border-cosmic-slate/20">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-coral-energy/10 via-electric-blue/10 to-amethyst/10 opacity-50"></div>
              
              <div className="px-5 py-3 relative">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-pure-white font-semibold flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Profile Completion
                  </h3>
                  <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-coral-energy via-electric-blue to-amethyst">
                    {businessProfile.profileCompletion}%
                  </div>
                </div>
                
                <div className="w-full bg-cosmic-slate/40 h-3 rounded-full overflow-hidden relative">
                  {/* Animated pulsing effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-coral-energy via-electric-blue to-amethyst opacity-30"
                    animate={{ 
                      x: ['-100%', '100%'],
                    }}
                    transition={{ 
                      repeat: Infinity,
                      duration: 3,
                      ease: "easeInOut",
                    }}
                  />
                  
                  {/* Actual progress bar */}
                  <div 
                    className="relative h-3 rounded-full bg-gradient-to-r from-coral-energy via-electric-blue to-amethyst"
                    style={{ width: `${businessProfile.profileCompletion}%` }}
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-pure-white/30 rounded-full"></div>
                  </div>
                </div>
                
                {/* Progress breakdown */}
                <div className="flex mt-3 text-xs justify-between">
                  <div className="text-ghost-gray">Beginner</div>
                  <div className="text-ghost-gray">Advanced</div>
                  <div className="text-ghost-gray">Expert</div>
                </div>
              </div>
              
              <div className="px-3 py-2 bg-cosmic-slate/20 text-center">
                <span className="text-xs text-soft-silver">
                  {businessProfile.profileCompletion < 40 
                    ? "Enhance your profile to unlock more insights"
                    : businessProfile.profileCompletion < 70
                    ? "Good progress! Complete more sections for better analysis"
                    : "Almost there! Fill remaining sections for complete analysis"
                  }
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Incomplete Sections Dashboard */}
      {businessProfile?.incompleteSections && businessProfile.incompleteSections.length > 0 && (
        <motion.div 
          className="bg-gradient-to-br from-midnight-navy/80 to-cosmic-slate/20 rounded-xl p-5 mb-6 border border-cosmic-slate/30 shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center mb-5 pb-3 border-b border-cosmic-slate/20">
            <div className="w-10 h-10 rounded-lg bg-electric-blue/20 flex items-center justify-center mr-3">
              <span className="text-xl">📋</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-pure-white">Complete Your Profile</h3>
              <p className="text-soft-silver text-sm">Add missing information to enhance your business profile analysis</p>
            </div>
            <div className="ml-auto bg-cosmic-slate/30 rounded-full px-3 py-1 text-xs font-medium text-pure-white">
              {businessProfile.incompleteSections.length} items remaining
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {businessProfile.incompleteSections.map(section => (
              <motion.button
                key={section.id}
                onClick={() => {
                  setUploadSection(section);
                  setShowUploadForm(true);
                }}
                className="flex items-center p-4 rounded-lg bg-cosmic-slate/20 hover:bg-electric-blue/10 transition-all group border border-cosmic-slate/30 shadow-sm"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 0 12px rgba(45, 127, 249, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-10 h-10 rounded-lg bg-pure-white/10 flex items-center justify-center mr-3 group-hover:bg-electric-blue/20 transition-all">
                  <span className="text-pure-white text-xl font-bold">+</span>
                </div>
                <div className="text-left">
                  <p className="text-pure-white font-medium">{section.name}</p>
                  <p className="text-ghost-gray text-xs flex items-center mt-1">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Click to add information
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Upload Data Form */}
      {showUploadForm && uploadSection && (
        <motion.div 
          className="bg-midnight-navy rounded-lg p-6 mb-6 border border-cosmic-slate/40"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-pure-white">Upload {uploadSection.name} Data</h3>
            <button 
              onClick={() => setShowUploadForm(false)} 
              className="text-ghost-gray hover:text-pure-white"
            >
              Cancel
            </button>
          </div>
          
          <p className="text-soft-silver mb-4">Provide additional information to enhance your business profile.</p>
          
          <div className="mb-4">
            <label className="block text-ghost-gray mb-2">Additional Information</label>
            <textarea 
              value={uploadData}
              onChange={(e) => setUploadData(e.target.value)}
              className="w-full bg-cosmic-slate bg-opacity-30 border border-cosmic-slate rounded-md p-3 text-pure-white"
              rows={4}
              placeholder={`Enter information about your ${uploadSection.name.toLowerCase()}...`}
            />
          </div>
          
          <motion.button
            onClick={handleUploadSubmit}
            className="bg-electric-blue text-pure-white px-6 py-2 rounded-md font-medium flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="mr-2">+</span>
            Add Information
          </motion.button>
        </motion.div>
      )}
      
      {/* DNA Segments Hexagon Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {dnaSegments.map((segment) => {
          const category = segment.category as keyof typeof categoryColors;
          
          return (
            <motion.div
              key={segment.id}
              className={`relative bg-gradient-to-br from-midnight-navy to-cosmic-slate/30 p-5 rounded-xl cursor-pointer overflow-hidden group border border-cosmic-slate/30 shadow-md`}
              whileHover={{ 
                scale: 1.02,
                boxShadow: category === 'operations' ? "0 5px 15px rgba(56, 178, 172, 0.2)" :
                           category === 'finance' ? "0 5px 15px rgba(45, 127, 249, 0.2)" :
                           category === 'marketing' ? "0 5px 15px rgba(245, 101, 101, 0.2)" :
                           "0 5px 15px rgba(183, 148, 244, 0.2)"
              }}
              onClick={() => setSelectedSegment(segment === selectedSegment ? null : segment)}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full bg-gradient-to-br opacity-20 ${categoryGradients[category]}`} />
              
              <div className="flex items-start mb-5">
                <div className={`w-14 h-14 rounded-xl ${categoryBg[category]} flex items-center justify-center mr-4 border border-cosmic-slate/30 shadow-sm relative`}>
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br opacity-40 ${categoryGradients[category]}`}></div>
                  <span className="text-2xl relative">{categoryIcons[category]}</span>
                </div>
                <div className="flex-grow pt-1">
                  <h3 className="text-pure-white font-semibold text-lg">{segment.name}</h3>
                  <p className={`text-sm ${categoryColors[category].split(' ')[1]} flex items-center`}>
                    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                      category === 'operations' ? 'bg-teal-pulse' :
                      category === 'finance' ? 'bg-electric-blue' :
                      category === 'marketing' ? 'bg-coral-energy' :
                      'bg-amethyst'
                    }`}></span>
                    {segment.category}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cosmic-slate/30 text-pure-white font-bold text-xl relative mb-1">
                    <div className="absolute inset-0 rounded-full border-2 border-cosmic-slate/20"></div>
                    {segment.strength}
                  </div>
                  <span className="text-ghost-gray text-xs">strength</span>
                </div>
              </div>
              
              <p className="text-soft-silver text-sm mb-4 line-clamp-2 min-h-[40px]">
                {segment.description}
              </p>
              
              <div className="w-full bg-cosmic-slate/30 h-2 rounded-full overflow-hidden mb-4 relative">
                <div className="absolute inset-0 opacity-20 overflow-hidden">
                  <motion.div 
                    className={`h-full bg-gradient-to-r ${
                      category === 'operations' ? 'from-teal-pulse to-teal-pulse/50' :
                      category === 'finance' ? 'from-electric-blue to-electric-blue/50' :
                      category === 'marketing' ? 'from-coral-energy to-coral-energy/50' :
                      'from-amethyst to-amethyst/50'
                    }`}
                    animate={{ 
                      x: ['-100%', '100%'],
                    }}
                    transition={{ 
                      repeat: Infinity,
                      duration: 2,
                      ease: "linear",
                    }}
                  />
                </div>
                <div 
                  className={`h-2 relative ${
                    category === 'operations' ? 'bg-teal-pulse' :
                    category === 'finance' ? 'bg-electric-blue' :
                    category === 'marketing' ? 'bg-coral-energy' :
                    'bg-amethyst'
                  }`}
                  style={{ width: `${segment.strength}%` }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-pure-white/40 rounded-full"></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-xs text-soft-silver">
                  {segment.insights.length} insights available
                </div>
                <button className="text-ghost-gray text-xs group-hover:text-pure-white transition-colors flex items-center bg-cosmic-slate/30 hover:bg-cosmic-slate/50 rounded-full px-3 py-1.5">
                  View Details
                  <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Add New DNA Component Button */}
      <motion.button
        className="mt-5 p-4 rounded-xl border-2 border-dashed border-cosmic-slate/40 w-full flex items-center justify-center text-ghost-gray hover:text-pure-white hover:border-cosmic-slate/60 transition-colors group shadow-sm"
        whileHover={{ 
          scale: 1.01,
          boxShadow: "0 0 12px rgba(255, 255, 255, 0.1)"
        }}
        whileTap={{ scale: 0.99 }}
      >
        <span className="flex items-center">
          <span className="w-10 h-10 rounded-lg bg-pure-white/10 flex items-center justify-center mr-2 group-hover:bg-pure-white/20 transition-all">
            <span className="text-pure-white text-xl font-bold">+</span>
          </span>
          <span className="font-medium">Add Custom Business Component</span>
        </span>
      </motion.button>
      
      {/* Selected segment details */}
      {selectedSegment && (
        <motion.div 
          className="mt-6 bg-midnight-navy p-6 rounded-xl overflow-hidden border border-cosmic-slate/30"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center mb-5">
            <div className={`w-12 h-12 rounded-lg ${
              categoryBg[selectedSegment.category as keyof typeof categoryBg]
            } flex items-center justify-center mr-4 border border-cosmic-slate/30`}>
              <span className="text-2xl">{
                categoryIcons[selectedSegment.category as keyof typeof categoryIcons]
              }</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-pure-white">{selectedSegment.name}</h3>
              <p className={`text-sm ${
                categoryColors[selectedSegment.category as keyof typeof categoryColors].split(' ')[1]
              }`}>
                {selectedSegment.category}
              </p>
            </div>
            <button 
              className="ml-auto text-ghost-gray hover:text-pure-white p-2"
              onClick={() => setSelectedSegment(null)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-5 bg-cosmic-slate bg-opacity-20 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-ghost-gray">Strength Score</span>
              <span className="text-pure-white font-semibold">{selectedSegment.strength}/100</span>
            </div>
            <div className="w-full bg-cosmic-slate/30 h-3 rounded-full overflow-hidden">
              <div 
                className={`h-3 ${
                  selectedSegment.category === 'operations' ? 'bg-teal-pulse' :
                  selectedSegment.category === 'finance' ? 'bg-electric-blue' :
                  selectedSegment.category === 'marketing' ? 'bg-coral-energy' :
                  'bg-amethyst'
                }`}
                style={{ width: `${selectedSegment.strength}%` }}
              ></div>
            </div>
            <p className="text-soft-silver text-sm mt-3">
              {selectedSegment.strength < 40 ? "Needs significant improvement" :
               selectedSegment.strength < 70 ? "Shows good potential with room for growth" :
               "Strong area of your business"}
            </p>
          </div>
          
          <p className="text-soft-silver mb-5">{selectedSegment.description}</p>
          
          <div>
            <h4 className="text-pure-white font-medium mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Key Insights
            </h4>
            <ul className="space-y-3">
              {selectedSegment.insights.map((insight, index) => (
                <li key={index} className="bg-cosmic-slate bg-opacity-20 p-4 rounded-md text-soft-silver border-l-2 border-cosmic-slate/60">
                  {insight}
                </li>
              ))}
            </ul>
            
            <div className="mt-5 pt-4 border-t border-cosmic-slate/20 flex justify-between">
              <button className="text-electric-blue flex items-center text-sm font-medium">
                <span className="mr-1">+</span>
                Add Custom Insight
              </button>
              
              <button className="text-ghost-gray hover:text-pure-white text-sm flex items-center">
                Export Analysis
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
};

// Coach Selection Component
const RecommendedCoachesSection = ({ coaches }: { coaches: Coach[] }) => {
  const navigate = useNavigate();
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  
  // Debug log to see coaches array
  console.log('Coaches in RecommendedCoachesSection:', coaches);
  
  const handleSelectCoach = (coach: Coach) => {
    setSelectedCoach(coach);
  };
  
  const handleStartSession = () => {
    if (selectedCoach) {
      navigate(`/sandbox/${selectedCoach.id}`);
    }
  };
  
  return (
    <section className="card mb-10">
      <h2 className="text-2xl font-semibold text-pure-white mb-4">Innovation Coaches</h2>
      <p className="text-ghost-gray mb-6">
        Select an innovation coach that matches your business style and goals.
      </p>
      
      {/* Horizontally scrollable coach avatars */}
      <div className="mb-8 overflow-x-auto custom-scrollbar">
        <div className="flex flex-wrap justify-center gap-8 w-full px-4 py-8 my-2">
          {coaches.map((coach, index) => (
            <motion.div
              key={coach.id}
              className="flex flex-col items-center cursor-pointer p-2 coach-avatar-container"
              whileHover={{ y: -5, scale: 1.05 }}
              animate={{ 
                y: coach === selectedCoach ? -5 : 0,
                scale: coach === selectedCoach ? 1.05 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              onClick={() => handleSelectCoach(coach)}
              style={{ transformOrigin: 'center center' }}
            >
              <div 
                className={`w-20 h-20 mb-3 rounded-lg ${coach === selectedCoach ? 'border-2 border-pure-white ring-2 ring-electric-blue shadow-lg shadow-electric-blue/30' : 'border-2 border-cosmic-slate'}`}
                style={{ backgroundColor: coach.accentColor }}
              >
                {/* In a real app, this would be an image */}
                <div className="w-full h-full flex items-center justify-center text-pure-white font-bold text-xl">
                  {coach.name.split(' ').map(part => part[0]).join('')}
                </div>
              </div>
              <p className="text-pure-white text-center text-sm font-medium max-w-[90px] truncate">{coach.name}</p>
              <p className="text-ghost-gray text-center text-xs max-w-[100px] truncate">{coach.title}</p>
              {coach === selectedCoach && (
                <div className="mt-1 text-xs text-electric-blue font-semibold">
                  Selected
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Selected coach details */}
      {selectedCoach ? (
        <motion.div 
          className="bg-midnight-navy bg-opacity-50 p-4 rounded-xl overflow-hidden"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col md:flex-row gap-6">
            <div 
              className="w-28 h-28 rounded-lg flex-shrink-0 flex items-center justify-center text-pure-white text-3xl font-bold border-2 border-cosmic-slate shadow-lg"
              style={{ backgroundColor: selectedCoach.accentColor }}
            >
              {selectedCoach.name.split(' ').map(part => part[0]).join('')}
            </div>
            
            <div className="flex-grow">
              <h3 className="text-xl font-semibold text-pure-white mb-1">{selectedCoach.name}</h3>
              <p className="text-soft-silver mb-2">{selectedCoach.title}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCoach.expertise.map((area, index) => (
                  <span key={index} className="text-xs px-2 py-1 rounded-full bg-cosmic-slate text-ghost-gray">
                    {area}
                  </span>
                ))}
              </div>
              
              <p className="text-soft-silver mb-4">{selectedCoach.description}</p>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-ghost-gray text-sm">Risk Appetite</div>
                  <div className="w-full bg-cosmic-slate h-1 rounded-full mt-1">
                    <div 
                      className="bg-electric-blue h-1 rounded-full"
                      style={{ width: `${selectedCoach.riskAppetite}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="text-ghost-gray text-sm">Time Horizon</div>
                  <div className="w-full bg-cosmic-slate h-1 rounded-full mt-1">
                    <div 
                      className="bg-teal-pulse h-1 rounded-full"
                      style={{ width: `${selectedCoach.timeHorizon}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="text-ghost-gray text-sm">Resource Intensity</div>
                  <div className="w-full bg-cosmic-slate h-1 rounded-full mt-1">
                    <div 
                      className="bg-coral-energy h-1 rounded-full"
                      style={{ width: `${selectedCoach.resourceIntensity}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <motion.button
                onClick={handleStartSession}
                className="btn btn-primary px-6 py-3 relative overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Start Coaching Session</span>
                <motion.div 
                  className="absolute inset-0 bg-electric-blue" 
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="bg-midnight-navy bg-opacity-50 p-4 rounded-xl text-center">
          <p className="text-ghost-gray">Select a coach above to view their profile and start a session.</p>
        </div>
      )}
    </section>
  );
};

// Matchmaking resources section
const MatchmakingSection = () => {
  return (
    <section className="card">
      <h2 className="text-2xl font-semibold text-pure-white mb-4">Recommended Resources</h2>
      <p className="text-ghost-gray mb-6">
        Based on your business profile, here are some resources that might help you.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-cosmic-slate bg-opacity-30 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-pure-white mb-2">Innovation Framework</h3>
          <p className="text-soft-silver mb-3">
            A structured approach to generating and implementing new ideas.
          </p>
          <button className="btn btn-secondary text-sm">Learn More</button>
        </div>
        
        <div className="bg-cosmic-slate bg-opacity-30 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-pure-white mb-2">Market Analysis Tool</h3>
          <p className="text-soft-silver mb-3">
            Identify opportunities and threats in your market landscape.
          </p>
          <button className="btn btn-secondary text-sm">Learn More</button>
        </div>
        
        <div className="bg-cosmic-slate bg-opacity-30 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-pure-white mb-2">Funding Resources</h3>
          <p className="text-soft-silver mb-3">
            Options for financing your innovation initiatives.
          </p>
          <button className="btn btn-secondary text-sm">Learn More</button>
        </div>
      </div>
    </section>
  );
};

const DashboardPage = () => {
  const { businessProfile } = useBusinessProfile();
  const { coaches } = useCoach();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // Add effect to handle initial loading
  useEffect(() => {
    // Simulate a small loading delay for smoother UI transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    
    return () => clearTimeout(timer);
  }, []);
  
  // If we're still loading, show a loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-deep-space flex flex-col items-center justify-center">
        <motion.div 
          className="w-16 h-16 border-4 border-t-transparent border-electric-blue rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-ghost-gray mt-4">Loading your innovation dashboard...</p>
      </div>
    );
  }
  
  // If profile is not available after loading, something went wrong
  if (!businessProfile) {
    return (
      <div className="min-h-screen bg-deep-space flex flex-col items-center justify-center p-6 text-center">
        <div className="card max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-pure-white mb-4">Missing Business Profile</h2>
          <p className="text-soft-silver mb-6">
            We couldn't find your business profile information. You may need to complete the onboarding process.
          </p>
          <button 
            onClick={() => navigate('/onboarding')} 
            className="btn btn-primary w-full"
          >
            Go to Onboarding
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 gap-6">
        <RecommendedCoachesSection coaches={coaches} />
        <BusinessDNASection dnaSegments={businessProfile.dnaSegments} />
        <MatchmakingSection />
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage; 