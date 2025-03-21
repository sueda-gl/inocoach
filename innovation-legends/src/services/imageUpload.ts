/**
 * Image Upload Service
 * 
 * Handles uploading institution images for the Recommended Resources section.
 * In a real production environment, this would connect to a server API for file uploads.
 */

// Map of resource IDs to their file paths
const resourceImageMap = {
  1: '/institutions/university-stgallen.jpg',
  2: '/institutions/eth-zurich.jpg',
  3: '/institutions/swiss-innovation-park.jpg'
};

/**
 * Uploads an image for a specific resource
 * This is a simulated upload function that actually just saves to local storage
 * In a real app, this would upload to a server
 */
export const uploadInstitutionImage = async (resourceId: number, file: File): Promise<string> => {
  // Simulate network delay for realistic feel
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return new Promise<string>((resolve, reject) => {
    try {
      // Read the file as data URL 
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          // In a real app, we'd upload to a server and get back a URL
          // For this demo, we'll store the data URL in localStorage
          const imageDataUrl = e.target.result as string;
          localStorage.setItem(`institution-image-${resourceId}`, imageDataUrl);
          
          // Resolve with the path that would be used in production
          resolve(resourceImageMap[resourceId as keyof typeof resourceImageMap]);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Gets the image path or data URL for a specific resource
 * Checks localStorage first, otherwise returns the default path
 */
export const getInstitutionImageSrc = (resourceId: number): string => {
  // Check if we have a saved image in localStorage
  const savedImage = localStorage.getItem(`institution-image-${resourceId}`);
  if (savedImage) {
    return savedImage;
  }
  
  // Otherwise return the default path
  return resourceImageMap[resourceId as keyof typeof resourceImageMap];
};

/**
 * Checks if any institution images have been uploaded
 */
export const hasUploadedInstitutionImages = (): boolean => {
  return (
    localStorage.getItem('institution-image-1') !== null ||
    localStorage.getItem('institution-image-2') !== null ||
    localStorage.getItem('institution-image-3') !== null
  );
};

export default {
  uploadInstitutionImage,
  getInstitutionImageSrc,
  hasUploadedInstitutionImages
}; 