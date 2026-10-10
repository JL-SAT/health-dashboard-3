
import React, { useRef } from 'react';
import TrashIcon from './icons/TrashIcon';
import EditIcon from './icons/EditIcon';
import ShareIcon from './icons/ShareIcon';
import { HospitalIcon } from './icons/InfoIcons';
import BloodPressureIcon from './icons/BloodPressureIcon';
import CheckboxIcon from './icons/CheckboxIcon';
import CheckboxCheckedIcon from './icons/CheckboxCheckedIcon';
import { useDateFormatter } from '../hooks/useDateFormatter';
import { useI18n } from '../i18n/index';


interface BloodPressureEntry {
    id: number;
    systolic: string;
    diastolic: string;
    pulse: string;
    date: string;
    time: string;
}
  
interface AppointmentEntry {
    id: number;
    hospital: string;
    date: string;
    time: string;
    doctor: string;
    purpose: string;
    attachments?: { name: string; path: string }[];
}
  
type Reading = BloodPressureEntry | AppointmentEntry;

function isBloodPressureEntry(reading: Reading): reading is BloodPressureEntry {
    return (reading as BloodPressureEntry).systolic !== undefined;
}

interface CompactReadingCardProps {
  reading: Reading;
  onSelect: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onShare: () => void;
  index: number;
  isDeleting: boolean;
  isSelectionModeActive: boolean;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
}

const AttachmentIcon: React.FC = () => (
    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
);

const CompactReadingCard: React.FC<CompactReadingCardProps> = ({ reading, onSelect, onDelete, onEdit, onShare, index, isDeleting, isSelectionModeActive, isSelected, onToggleSelect }) => {
    const ref = useRef<HTMLDivElement>(null);
    const { formatDate } = useDateFormatter();
    const { t } = useI18n();

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        const rotateX = y * -10;
        const rotateY = x * 10;
        ref.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    };

    const handleMouseLeave = () => {
        if (!ref.current) return;
        ref.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    };

    const formattedDate = formatDate(reading.date, { year: 'numeric', month: 'short', day: 'numeric' });
    
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete();
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit();
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        onShare();
    };

    const handleClick = () => {
        if (isSelectionModeActive) {
            onToggleSelect(reading.id);
        } else {
            onSelect();
        }
    };

    const isBP = isBloodPressureEntry(reading);

    let isAttended = false;
    if (!isBP) {
        try {
            if (reading.date && reading.time && /^\d{4}-\d{2}-\d{2}$/.test(reading.date) && /^\d{2}:\d{2}$/.test(reading.time)) {
                const appointmentDateTime = new Date(`${reading.date}T${reading.time}:00`);
                if (!isNaN(appointmentDateTime.getTime())) {
                    isAttended = appointmentDateTime < new Date();
                }
            }
        } catch (e) {
            console.error("Error parsing appointment date/time:", e);
        }
    }

    const themeClasses = {
        attended: {
            border: 'border-green-900/50 hover:border-green-500/70',
            shadow: 'hover:shadow-green-500/20',
            bg: 'bg-green-950/40 dark:bg-green-900/30',
            icon: 'bg-green-500/10 text-green-500 dark:text-green-400',
        },
        future: {
            border: 'border-red-900/50 hover:border-red-500/70',
            shadow: 'hover:shadow-red-500/20',
            bg: 'bg-gray-900/80 dark:bg-gray-900/60',
            icon: 'bg-red-500/10 text-red-500 dark:text-red-400',
        },
        bp: {
            border: 'border-red-900/50 hover:border-red-500/70',
            shadow: 'hover:shadow-red-500/20',
            bg: 'bg-gray-900/80 dark:bg-gray-900/60',
            icon: 'bg-red-500/10 text-red-500 dark:text-red-400',
        }
    };
    
    const currentTheme = isBP ? themeClasses.bp : (isAttended ? themeClasses.attended : themeClasses.future);

    const appointmentTitle = !isBP ? [reading.purpose, reading.doctor, reading.hospital].filter(Boolean).join(', ') : '';

    return (
        <div 
            ref={ref}
            onMouseMove={isSelectionModeActive ? undefined : handleMouseMove}
            onMouseLeave={isSelectionModeActive ? undefined : handleMouseLeave}
            onClick={handleClick}
            style={{ animationDelay: `${index * 75}ms`, transformStyle: 'preserve-3d' }}
            className={`group flex items-center justify-between border rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-lg cursor-pointer transition-all duration-300 ${isDeleting ? 'animate-card-exit' : 'opacity-0 animate-card-enter'} ${isSelected ? 'bg-blue-900/30 border-blue-500/80' : `${currentTheme.bg} ${currentTheme.border}`} ${currentTheme.shadow}`}
        >
            <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                {isSelectionModeActive && (
                    <div className="pl-1 flex-shrink-0">
                        {isSelected ? <CheckboxCheckedIcon /> : <CheckboxIcon />}
                    </div>
                )}
                <div className={`p-2 rounded-full flex-shrink-0 ${currentTheme.icon}`}>
                    {isBP ? <BloodPressureIcon className="w-5 h-5" /> : <HospitalIcon />}
                </div>
                <div className="truncate">
                    {isBP ? (
                        <>
                            <p className="text-white font-bold flex items-baseline gap-1 flex-wrap">
                                <span className="text-lg sm:text-xl">{reading.systolic}</span>
                                <span className="text-gray-400 font-light text-sm sm:text-md">/</span>
                                <span className="text-lg sm:text-xl">{reading.diastolic}</span>
                                <span className="text-[10px] sm:text-xs text-gray-400 ml-1">{t('readingCard.mmhg')}</span>
                                {reading.pulse && (
                                    <>
                                        <span className="text-gray-400 font-light text-sm sm:text-md mx-2">|</span>
                                        <span className="text-lg sm:text-xl">{reading.pulse}</span>
                                        <span className="text-[10px] sm:text-xs text-gray-400 ml-1">{t('readingCard.bpm')}</span>
                                    </>
                                )}
                            </p>
                            <p className="text-sm text-gray-400 truncate">{t('readingCard.dateTime', { date: formattedDate, time: reading.time || 'N/A' })}</p>
                        </>
                    ) : (
                        <>
                             <div className="text-white font-bold truncate flex items-center gap-2">
                                <p className="truncate">{appointmentTitle || 'Appointment'}</p>
                                {isAttended && (
                                    <span className="text-xs font-semibold bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full flex-shrink-0">
                                        {t('readingCard.attendedBadge')}
                                    </span>
                                )}
                                {!isBP && reading.attachments && reading.attachments.length > 0 && (
                                    <AttachmentIcon />
                                )}
                            </div>
                            <p className="text-sm text-gray-400">{t('readingCard.dateTime', { date: formattedDate, time: reading.time || 'N/A' })}</p>
                        </>
                    )}
                </div>
            </div>

            <div className={`flex items-center ml-4 transition-all duration-300 ${isSelectionModeActive ? 'opacity-0 scale-75' : 'opacity-0 group-hover:opacity-100 group-hover:scale-100'}`}>
                <button
                    onClick={handleShare}
                    className="p-2 rounded-full bg-gray-700/50 dark:bg-gray-800/50 hover:bg-green-500/30 text-gray-400 hover:text-green-400 transition-all duration-300"
                    aria-label={t('common.share')}
                >
                    <ShareIcon />
                </button>
                <button
                    onClick={handleEdit}
                    className="p-2 rounded-full bg-gray-700/50 dark:bg-gray-800/50 hover:bg-blue-500/30 text-gray-400 hover:text-blue-400 transition-all duration-300"
                    aria-label="Edit reading"
                >
                    <EditIcon />
                </button>
                <button
                    onClick={handleDelete}
                    className="p-2 rounded-full bg-gray-700/50 dark:bg-gray-800/50 hover:bg-red-500/30 text-gray-400 hover:text-red-400 transition-all duration-300"
                    aria-label={t('common.delete')}
                >
                    <TrashIcon />
                </button>
            </div>
        </div>
    );
}

export default CompactReadingCard;
