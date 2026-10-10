
import React from 'react';

const GlobeIcon: React.FC = () => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className="h-6 w-6" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={2}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.705 11a8.002 8.002 0 018.59 0M7.705 11A8.001 8.001 0 003 12c0 4.418 3.582 8 8 8s8-3.582 8-8c0-1.482-.405-2.868-1.12-4.045M12 12a4 4 0 100-8 4 4 0 000 8z" 
      />
    </svg>
  );
};

export default GlobeIcon;
