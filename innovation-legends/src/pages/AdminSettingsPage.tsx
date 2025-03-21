import React, { useState } from 'react';
import { motion } from 'framer-motion';
import InstitutionImageUpload from '../components/admin/InstitutionImageUpload';
import { uploadInstitutionImage, hasUploadedInstitutionImages } from '../services/imageUpload';

// A simple layout for admin pages
const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-deep-space text-pure-white p-4 md:p-8">
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-pure-white mb-2">Admin Settings</h1>
        <p className="text-ghost-gray">Configure and customize your innovation coaching platform.</p>
      </header>
      
      <main>{children}</main>
      
      <footer className="mt-12 py-4 border-t border-white border-opacity-10 text-center text-ghost-gray">
        <p>Innovation Legends Admin Panel &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  </div>
);

const AdminSettingsPage = () => {
  const [uploadMessages, setUploadMessages] = useState<{[key: number]: string}>({});
  
  // Handle image upload
  const handleImageUpload = async (resourceId: number, file: File) => {
    try {
      await uploadInstitutionImage(resourceId, file);
      setUploadMessages(prev => ({
        ...prev,
        [resourceId]: `Successfully uploaded image for resource ${resourceId}`
      }));
      setTimeout(() => {
        setUploadMessages(prev => {
          const newMessages = { ...prev };
          delete newMessages[resourceId];
          return newMessages;
        });
      }, 3000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadMessages(prev => ({
        ...prev,
        [resourceId]: `Error uploading image: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
    }
  };
  
  // Check if any images have been uploaded
  const hasUploads = hasUploadedInstitutionImages();
  
  return (
    <AdminLayout>
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-semibold mb-4">Appearance Settings</h2>
        <p className="text-ghost-gray mb-6">
          Customize how your innovation coaching platform looks and feels.
        </p>
        
        {/* Upload status messages */}
        {Object.entries(uploadMessages).length > 0 && (
          <div className="mb-6">
            {Object.entries(uploadMessages).map(([id, message]) => (
              <motion.div 
                key={id}
                className="bg-cosmic-slate bg-opacity-20 p-3 rounded-lg text-soft-silver mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <p>{message}</p>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Institution image upload component */}
        <InstitutionImageUpload onImageUpload={handleImageUpload} />
        
        {/* Information about uploaded images */}
        {hasUploads && (
          <motion.div 
            className="mt-4 p-3 bg-cosmic-slate bg-opacity-20 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <p className="text-ghost-gray">
              <strong>Note:</strong> Your uploaded images will be used in the Recommended Resources section on the dashboard.
              They are currently stored in your browser's local storage for demonstration purposes.
              In a production environment, they would be saved to a server.
            </p>
          </motion.div>
        )}
      </motion.div>
      
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-pure-white mb-4">Other Settings</h2>
        <p className="text-ghost-gray">
          Additional settings will be available here in the future.
        </p>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminSettingsPage; 