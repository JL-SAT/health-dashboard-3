
import React from 'react';

const BackArrowIcon: React.FC = () => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className="h-6 w-6" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" 
      />
    </svg>
  );
};

export default BackArrowIcon;
