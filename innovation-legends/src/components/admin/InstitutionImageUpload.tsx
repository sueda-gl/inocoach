import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface InstitutionImageUploadProps {
  onImageUpload: (resourceId: number, file: File) => Promise<void>;
}

const InstitutionImageUpload: React.FC<InstitutionImageUploadProps> = ({ onImageUpload }) => {
  const fileInputRefs = useRef<Array<HTMLInputElement | null>>([null, null, null]);
  const [uploading, setUploading] = useState<{[key: number]: boolean}>({});
  const [preview, setPreview] = useState<{[key: number]: string}>({});
  
  const resources = [
    { id: 1, name: "ETH Zürich" },
    { id: 2, name: "University of St. Gallen" },
    { id: 3, name: "Swiss Federal Laboratories" }
  ];

  const handleFileSelect = async (resourceId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreview(prev => ({
            ...prev,
            [resourceId]: e.target?.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
      
      // Start upload
      setUploading(prev => ({ ...prev, [resourceId]: true }));
      
      try {
        await onImageUpload(resourceId, file);
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setUploading(prev => ({ ...prev, [resourceId]: false }));
      }
    }
  };

  return (
    <div className="p-4 bg-midnight-navy rounded-lg">
      <h3 className="text-xl font-semibold text-pure-white mb-4">Upload Institution Images</h3>
      <p className="text-ghost-gray mb-4">
        Upload images to represent real institutions in the Recommended Resources section.
        For best results, use high-quality images with a 16:9 aspect ratio.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resources.map((resource, index) => (
          <motion.div 
            key={resource.id}
            className="bg-cosmic-slate bg-opacity-30 p-4 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <h4 className="text-lg font-medium text-pure-white mb-2">{resource.name}</h4>
            
            <div 
              className="w-full h-32 rounded-lg mb-3 bg-deep-space flex items-center justify-center overflow-hidden cursor-pointer"
              onClick={() => fileInputRefs.current[index]?.click()}
            >
              {preview[resource.id] ? (
                <img 
                  src={preview[resource.id]} 
                  alt={resource.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-ghost-gray text-center p-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>Click to upload image</p>
                </div>
              )}
            </div>
            
            <input
              type="file"
              ref={(el) => {
                fileInputRefs.current[index] = el;
              }}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileSelect(resource.id, e)}
            />
            
            <motion.button
              className={`btn w-full ${preview[resource.id] ? 'btn-secondary' : 'btn-primary'} text-sm`}
              onClick={() => fileInputRefs.current[index]?.click()}
              disabled={uploading[resource.id]}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {uploading[resource.id] ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : preview[resource.id] ? 'Change Image' : 'Upload Image'}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default InstitutionImageUpload; 