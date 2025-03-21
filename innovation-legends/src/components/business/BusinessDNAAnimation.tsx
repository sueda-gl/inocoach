import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface BusinessDNAAnimationProps {
  progress: number; // 0 to 100
  pulseEffect?: boolean;
  color?: string;
}

const BusinessDNAAnimation = ({ 
  progress = 0, 
  pulseEffect = true,
  color = '#2D7FF9' // electric-blue
}: BusinessDNAAnimationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Create a dynamic helix animation using canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = 300;
    canvas.height = 300;
    
    // Animation variables
    let animationFrame: number;
    let angle = 0;
    
    // Function to draw the DNA helix
    const drawDNA = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Center point
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Calculate the number of segments to draw based on progress
      const maxSegments = 20;
      const segmentsToShow = Math.ceil((progress / 100) * maxSegments);
      
      // DNA parameters
      const radius = 60;
      const strandWidth = 10;
      const strandSpacing = 25;
      const segmentHeight = 15;
      
      // Draw the helix strands
      for (let i = 0; i < segmentsToShow; i++) {
        const segmentAngle = angle + (i * (Math.PI / 10));
        
        // Calculate positions
        const xOffset = Math.cos(segmentAngle) * radius;
        const yOffset = (i * segmentHeight) - (maxSegments * segmentHeight / 2);
        
        // Draw the connecting lines (base pairs)
        ctx.beginPath();
        ctx.moveTo(centerX + xOffset, centerY + yOffset);
        ctx.lineTo(centerX - xOffset, centerY + yOffset);
        ctx.strokeStyle = '#8B9CB8'; // soft-silver
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw the two DNA strand nodes
        // First strand
        ctx.beginPath();
        ctx.arc(centerX + xOffset, centerY + yOffset, strandWidth, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        // Second strand
        ctx.beginPath();
        ctx.arc(centerX - xOffset, centerY + yOffset, strandWidth, 0, Math.PI * 2);
        ctx.fillStyle = '#F56565'; // coral-energy
        ctx.fill();
      }
      
      // Add some particles around the helix to show it's being generated
      if (progress < 100 && pulseEffect) {
        for (let i = 0; i < 5; i++) {
          const particleAngle = Math.random() * Math.PI * 2;
          const particleDistance = radius + Math.random() * 50;
          const particleX = centerX + Math.cos(particleAngle) * particleDistance;
          const particleY = centerY + Math.sin(particleAngle) * particleDistance;
          const particleSize = Math.random() * 3 + 1;
          
          ctx.beginPath();
          ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(45, 127, 249, ${Math.random() * 0.5})`; // electric-blue with random opacity
          ctx.fill();
        }
      }
      
      // Update angle for animation
      angle += 0.02;
      
      // Continue animation
      animationFrame = requestAnimationFrame(drawDNA);
    };
    
    // Start animation
    drawDNA();
    
    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [progress, color, pulseEffect]);
  
  return (
    <div className="relative flex items-center justify-center">
      {/* Canvas for DNA animation */}
      <canvas 
        ref={canvasRef} 
        className="z-10"
        width={300} 
        height={300}
      />
      
      {/* Glowing background effect */}
      <motion.div 
        className="absolute inset-0 rounded-full opacity-30 z-0"
        animate={{ 
          boxShadow: pulseEffect 
            ? ['0 0 20px rgba(45, 127, 249, 0.3)', '0 0 40px rgba(45, 127, 249, 0.5)', '0 0 20px rgba(45, 127, 249, 0.3)'] 
            : '0 0 20px rgba(45, 127, 249, 0.3)'
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      {/* Progress indicator */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-soft-silver text-sm">
        {progress}% Complete
      </div>
    </div>
  );
};

export default BusinessDNAAnimation; 