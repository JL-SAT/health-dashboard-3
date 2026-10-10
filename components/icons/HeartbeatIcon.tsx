import React from 'react';

const HeartbeatIcon: React.FC = () => {
  return (
    <svg 
      className="w-16 h-16"
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      <path d="M2 12h2l2.5-5L9 14l2.5-3.5L14 12h2"></path>
    </svg>
  );
};

export default HeartbeatIcon;