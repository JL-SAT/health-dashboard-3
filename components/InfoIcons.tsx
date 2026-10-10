import React from 'react';

const iconProps = {
  className: "w-5 h-5",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
} as const;

export const HospitalIcon: React.FC = () => (
  <svg {...iconProps}><path d="M12 22V18M9 18H15M9 14H15M9 10H15M17 18V6C17 4.89543 16.1046 4 15 4H9C7.89543 4 7 4.89543 7 6V18M4 18H20"/></svg>
);

export const CalendarIcon: React.FC = () => (
  <svg {...iconProps}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);

export const ClockIcon: React.FC = () => (
  <svg {...iconProps}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);

export const DoctorIcon: React.FC = () => (
    <svg {...iconProps}><path d="M5.5 19c-1-1.5-1.5-3-1.5-4.5C4 9.67 7.58 6 12 6s8 3.67 8 8.5c0 1.5-.5 3-1.5 4.5"/><path d="M12 6V2m0 0a2 2 0 1 0-4 0v4m4-4a2 2 0 1 1 4 0v4"/></svg>
);

export const NotesIcon: React.FC = () => (
  <svg {...iconProps}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);

export const PurposeIcon: React.FC = () => (
    <svg {...iconProps}><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
);

export const AttachmentIcon: React.FC = () => (
  <svg {...iconProps}><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
);