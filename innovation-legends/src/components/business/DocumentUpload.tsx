import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface DocumentUploadProps {
  onUpload: (files: File[]) => void;
  supportedFormats?: string[];
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  title?: string;
  description?: string;
}

const DocumentUpload = ({
  onUpload,
  supportedFormats = ['.pdf', '.doc', '.docx', '.txt', '.csv', '.xls', '.xlsx'],
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 5,
  title = "Upload Business Documents",
  description = "Upload documents containing information about your business to help us analyze your needs better."
}: DocumentUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };
  
  const validateFiles = (filesToValidate: File[]): { valid: File[], errors: string[] } => {
    const validFiles: File[] = [];
    const newErrors: string[] = [];
    
    // Check if adding these files would exceed the max count
    if (files.length + filesToValidate.length > maxFiles) {
      newErrors.push(`You can upload a maximum of ${maxFiles} files.`);
      return { valid: validFiles, errors: newErrors };
    }
    
    filesToValidate.forEach(file => {
      // Check file size
      if (file.size > maxFileSize) {
        newErrors.push(`${file.name} exceeds the maximum file size of ${Math.round(maxFileSize / 1024 / 1024)}MB.`);
        return;
      }
      
      // Check file type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!supportedFormats.includes(fileExtension)) {
        newErrors.push(`${file.name} is not a supported file format.`);
        return;
      }
      
      // If all validations pass, add to valid files
      validFiles.push(file);
    });
    
    return { valid: validFiles, errors: newErrors };
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles);
    }
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  };
  
  const processFiles = (newFiles: File[]) => {
    const { valid, errors: newErrors } = validateFiles(newFiles);
    
    if (valid.length > 0) {
      const updatedFiles = [...files, ...valid];
      setFiles(updatedFiles);
      setErrors(newErrors);
      
      // Send to parent component
      onUpload(updatedFiles);
    } else {
      setErrors(newErrors);
    }
  };
  
  const handleRemoveFile = (indexToRemove: number) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(updatedFiles);
    onUpload(updatedFiles);
  };
  
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-pure-white mb-2">{title}</h3>
        <p className="text-soft-silver">{description}</p>
      </div>
      
      {/* Drag & Drop Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging 
            ? 'border-electric-blue bg-electric-blue/10' 
            : 'border-cosmic-slate/50 bg-midnight-navy/30 hover:border-cosmic-slate'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-cosmic-slate/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-ghost-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          
          <p className="text-ghost-gray mb-2">
            Drag and drop your files here, or
          </p>
          
          <motion.button
            className="bg-electric-blue text-pure-white rounded-lg px-4 py-2 font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleButtonClick}
          >
            Browse Files
          </motion.button>
          
          <input 
            ref={fileInputRef}
            type="file" 
            multiple
            onChange={handleFileInputChange}
            className="hidden"
            accept={supportedFormats.join(',')}
          />
          
          <p className="text-ghost-gray mt-4 text-sm">
            Supported formats: {supportedFormats.join(', ')}
          </p>
          <p className="text-ghost-gray text-sm">
            Max file size: {Math.round(maxFileSize / 1024 / 1024)}MB
          </p>
        </div>
      </div>
      
      {/* Error messages */}
      {errors.length > 0 && (
        <div className="mt-4 text-coral-energy">
          {errors.map((error, index) => (
            <p key={index} className="text-sm">{error}</p>
          ))}
        </div>
      )}
      
      {/* File list */}
      {files.length > 0 && (
        <div className="mt-6">
          <h4 className="text-pure-white font-medium mb-2">Uploaded Files ({files.length}/{maxFiles})</h4>
          <div className="space-y-3">
            {files.map((file, index) => (
              <motion.div 
                key={`${file.name}-${index}`}
                className="flex items-center justify-between bg-midnight-navy p-3 rounded-lg border border-cosmic-slate/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-cosmic-slate/30 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-ghost-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-pure-white font-medium">{file.name}</p>
                    <p className="text-ghost-gray text-xs">{Math.round(file.size / 1024)} KB</p>
                  </div>
                </div>
                <button 
                  className="text-ghost-gray hover:text-coral-energy p-1"
                  onClick={() => handleRemoveFile(index)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload; 