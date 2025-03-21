import { BusinessMetrics, BusinessProfile } from '../types';

export async function extractMetricsFromDocument(file: File): Promise<BusinessMetrics | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      
      try {
        // Extract metrics using regex patterns
        const metrics: BusinessMetrics = {
          revenue: extractNumberValue(content, /revenue:?\s*\$?([\d,.]+)/i) || 100,
          profit: extractNumberValue(content, /profit:?\s*\$?([\d,.]+)/i) || 10,
          customerSatisfaction: extractNumberValue(content, /customer satisfaction:?\s*([\d.]+)%?/i) || 70,
          marketShare: extractNumberValue(content, /market share:?\s*([\d.]+)%?/i) || 5,
          employeeEngagement: extractNumberValue(content, /employee engagement:?\s*([\d.]+)%?/i) || 60,
          innovationIndex: extractNumberValue(content, /innovation index:?\s*([\d.]+)%?/i) || 40
        };
        
        console.log('Extracted metrics:', metrics);
        resolve(metrics);
      } catch (error) {
        console.error('Error extracting metrics:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    if (file.type === 'application/pdf') {
      // For PDF files, we'd need a PDF parser library
      // For hackathon purposes, we can show an alert about PDF support
      alert('PDF parsing would require additional libraries. Using text extraction for now.');
      reader.readAsText(file);
    } else {
      // For text-based files (including Google Docs exports)
      reader.readAsText(file);
    }
  });
}

export async function extractBusinessProfileFromDocument(file: File): Promise<Partial<BusinessProfile>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      
      try {
        // Extract business profile using regex patterns
        const profile: Partial<BusinessProfile> = {
          name: extractStringValue(content, /business name:?\s*([^\n]+)/i) || undefined,
          industry: extractStringValue(content, /industry:?\s*([^\n]+)/i) || undefined,
          size: extractStringValue(content, /company size:?\s*([^\n]+)/i) || 
                extractStringValue(content, /size:?\s*([^\n]+)/i) || undefined,
          founded: extractNumberValue(content, /founded:?\s*(\d{4})/i) || 
                  extractNumberValue(content, /founding year:?\s*(\d{4})/i) || undefined
        };
        
        console.log('Extracted business profile:', profile);
        resolve(profile);
      } catch (error) {
        console.error('Error extracting business profile:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Helper to extract numeric values from text
function extractNumberValue(text: string, pattern: RegExp): number | null {
  const match = text.match(pattern);
  if (match && match[1]) {
    // Remove commas and convert to number
    return parseFloat(match[1].replace(/,/g, ''));
  }
  return null;
}

// Helper to extract string values
function extractStringValue(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
} 