
import React, { useRef } from 'react';

interface DashboardButtonProps {
  title: string;
  icon: React.ReactElement<{ className?: string }>;
  onClick: () => void;
}

const DashboardButton: React.FC<DashboardButtonProps> = ({ title, icon, onClick }) => {
  const ref = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    const rotateX = y * -20;
    const rotateY = x * 20;
    ref.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d' }}
      className="group relative w-full h-auto aspect-square max-w-[220px] sm:max-w-[280px] flex flex-col items-center justify-center p-6 bg-gray-900/40 dark:bg-gray-900/40 border border-gray-700/50 hover:border-red-500/50 rounded-3xl shadow-2xl backdrop-blur-xl cursor-pointer transition-all duration-300 ease-out hover:shadow-[0_0_50px_rgba(239,68,68,0.2)] focus:outline-none hover:bg-gray-800/60"
    >
      {/* Glossy gradient overlay */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Icon */}
      <div style={{ transform: 'translateZ(30px)' }} className="text-gray-400 group-hover:text-red-500 transition-colors duration-300 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        {React.cloneElement(icon, { className: "w-20 h-20 sm:w-24 sm:h-24 transition-transform duration-300 group-hover:scale-110" })}
      </div>
      
      {/* Text Box Style */}
      <span 
        style={{ transform: 'translateZ(50px)' }} 
        className="mt-6 px-6 py-2.5 bg-gray-800/80 border border-gray-600/50 group-hover:border-red-500/50 rounded-xl text-xl sm:text-2xl font-bold text-gray-200 group-hover:text-white group-hover:bg-red-600/20 transition-all duration-300 shadow-lg group-hover:shadow-red-900/20 tracking-wide"
      >
        {title}
      </span>

      {/* Decorative glows */}
      <div style={{ transform: 'translateZ(20px)' }} className="absolute -bottom-4 -right-4 w-24 h-24 bg-red-600/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      <div style={{ transform: 'translateZ(20px)' }} className="absolute -top-4 -left-4 w-20 h-20 bg-blue-600/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
    </button>
  );
};

export default DashboardButton;
