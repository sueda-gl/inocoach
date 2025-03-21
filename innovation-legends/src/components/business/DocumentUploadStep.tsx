import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DocumentUpload from './DocumentUpload';
import BusinessDNAAnimation from './BusinessDNAAnimation';
import { BusinessProfile } from '../../types';
import { extractMetricsFromDocument, extractBusinessProfileFromDocument } from '../../utils/documentProcessing';
import { useSimulation } from '../../context/SimulationContext';

interface DocumentUploadStepProps {
  businessProfile: Partial<BusinessProfile>;
  onUpdate: (updates: Partial<BusinessProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}

const DocumentUploadStep = ({
  businessProfile,
  onUpdate,
  onNext,
  onBack
}: DocumentUploadStepProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [animationProgress, setAnimationProgress] = useState(50); // Starting from 50% (after two steps)
  const [documentTypes, setDocumentTypes] = useState({
    financial: false,
    marketing: false,
    strategic: false
  });
  const { simulation, setSimulation } = useSimulation();
  
  // Document type options for classification
  const documentOptions = [
    { id: 'financial', name: 'Financial Documents', examples: 'Balance sheets, P&L statements, financial projections' },
    { id: 'marketing', name: 'Marketing Materials', examples: 'Market research, brand guidelines, customer data' },
    { id: 'strategic', name: 'Strategic Documents', examples: 'Business plans, SWOT analysis, organization charts' }
  ];
  
  // Update animation progress based on files and document types
  useEffect(() => {
    const fileProgress = Math.min(files.length, 3) * 10; // Up to 30% for files
    const typeProgress = Object.values(documentTypes).filter(Boolean).length * 5; // Up to 15% for document types
    
    setAnimationProgress(50 + fileProgress + typeProgress);
    
    // Update parent with document information
    if (files.length > 0) {
      onUpdate({
        documentData: {
          count: files.length,
          types: Object.entries(documentTypes)
            .filter(([_, value]) => value)
            .map(([key]) => key)
        }
      });
    }
  }, [files, documentTypes, onUpdate]);
  
  // Handle file uploads
  const handleUpload = async (uploadedFiles: File[]) => {
    setFiles(uploadedFiles);
    
    // Process the first file for metrics and business profile data
    if (uploadedFiles.length > 0) {
      try {
        // Extract metrics from document
        const metrics = await extractMetricsFromDocument(uploadedFiles[0]);
        
        // Extract business profile from document
        const profileData = await extractBusinessProfileFromDocument(uploadedFiles[0]);
        
        // If we found metrics, update the simulation context
        if (metrics) {
          setSimulation(prev => ({
            ...prev,
            currentMetrics: metrics,
          }));
          
          // Show success indicator
          console.log('Business metrics successfully extracted from document!');
        }
        
        // If we found profile data, update the business profile
        if (profileData && Object.keys(profileData).length > 0) {
          onUpdate(profileData);
          console.log('Business profile data extracted from document!');
        }
        
        // Show combined success message if either was successful
        if (metrics || (profileData && Object.keys(profileData).length > 0)) {
          alert('Business data successfully extracted from document!');
        }
      } catch (error) {
        console.error('Error processing document:', error);
      }
    }
  };
  
  // Handle document type classification
  const handleDocumentTypeChange = (type: string) => {
    setDocumentTypes(prev => ({
      ...prev,
      [type]: !prev[type as keyof typeof prev]
    }));
  };
  
  // Check if we have enough information to proceed
  const hasRequiredInfo = files.length > 0 && 
                          Object.values(documentTypes).some(Boolean);
  
  return (
    <div className="flex flex-col w-full">
      <h2 className="text-2xl font-semibold text-pure-white mb-2">Business Documents</h2>
      <p className="text-soft-silver mb-6">
        Upload relevant business documents to help me better understand your organization and provide more tailored innovation strategies.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Document upload */}
        <div className="md:col-span-2 bg-midnight-navy/50 rounded-lg border border-cosmic-slate/30 p-6 shadow-lg">
          <DocumentUpload
            onUpload={handleUpload}
            title="Upload Business Documents"
            description="These documents will help us analyze your business needs more effectively."
            supportedFormats={['.pdf', '.doc', '.docx', '.txt', '.csv', '.xls', '.xlsx', '.ppt', '.pptx']}
            maxFileSize={10 * 1024 * 1024} // 10MB
            maxFiles={5}
          />
          
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-pure-white font-medium mb-4">Document Classification</h3>
              <p className="text-soft-silver mb-3">
                What types of documents are you uploading? (Select all that apply)
              </p>
              
              <div className="space-y-3">
                {documentOptions.map(option => (
                  <div 
                    key={option.id} 
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      documentTypes[option.id as keyof typeof documentTypes]
                        ? 'bg-electric-blue/20 border-electric-blue'
                        : 'bg-cosmic-slate/20 border-cosmic-slate/40 hover:bg-cosmic-slate/30'
                    }`}
                    onClick={() => handleDocumentTypeChange(option.id)}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded mr-3 flex items-center justify-center ${
                        documentTypes[option.id as keyof typeof documentTypes]
                          ? 'bg-electric-blue text-pure-white'
                          : 'border border-ghost-gray'
                      }`}>
                        {documentTypes[option.id as keyof typeof documentTypes] && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="text-pure-white font-medium">{option.name}</div>
                        <div className="text-ghost-gray text-sm">{option.examples}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Visual representation */}
        <div className="flex flex-col bg-midnight-navy/50 rounded-lg border border-cosmic-slate/30 p-6 shadow-lg">
          <h3 className="text-pure-white font-medium text-center mb-4">Your Business DNA</h3>
          
          <div className="flex-grow flex items-center justify-center">
            <BusinessDNAAnimation 
              progress={animationProgress} 
              color="#B794F4" // amethyst
            />
          </div>
          
          {/* Upload status summary */}
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-electric-blue font-medium mb-2">Upload Status:</h4>
              <div className="text-soft-silver">
                {files.length === 0 ? (
                  <p className="text-ghost-gray italic">No documents uploaded yet...</p>
                ) : (
                  <p>{files.length} document{files.length !== 1 ? 's' : ''} uploaded</p>
                )}
              </div>
            </div>
            
            {files.length > 0 && (
              <div>
                <h4 className="text-teal-pulse font-medium mb-2">Document Types:</h4>
                <div className="text-soft-silver">
                  {Object.entries(documentTypes).some(([_, selected]) => selected) ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {documentOptions.map(option => (
                        documentTypes[option.id as keyof typeof documentTypes] && (
                          <li key={option.id}>{option.name}</li>
                        )
                      ))}
                    </ul>
                  ) : (
                    <p className="text-ghost-gray italic">No document types selected...</p>
                  )}
                </div>
              </div>
            )}
            
            <div className="bg-cosmic-slate/20 rounded p-3 border border-cosmic-slate/30">
              <p className="text-xs text-ghost-gray">
                Your documents are processed locally and will be used only to create a personalized innovation strategy.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="btn btn-secondary"
        >
          Back
        </button>
        <motion.button
          onClick={onNext}
          disabled={!hasRequiredInfo}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: !hasRequiredInfo ? 1 : 1.05 }}
          whileTap={{ scale: !hasRequiredInfo ? 1 : 0.95 }}
        >
          Next Step
        </motion.button>
      </div>
    </div>
  );
};

export default DocumentUploadStep; 