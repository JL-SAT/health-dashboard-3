
import React, { useRef, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { HospitalIcon, CalendarIcon, ClockIcon, DoctorIcon, NotesIcon, PurposeIcon, AttachmentIcon } from './icons/InfoIcons';
import BloodPressureIcon from './icons/BloodPressureIcon';
import TrashIcon from './icons/TrashIcon';
import EditIcon from './icons/EditIcon';
import ShareIcon from './icons/ShareIcon';
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
    pre_notes: string;
    post_notes: string;
    attachments?: { name: string; path: string }[];
}
  
type Reading = BloodPressureEntry | AppointmentEntry;

function isBloodPressureEntry(reading: Reading): reading is BloodPressureEntry {
    return (reading as BloodPressureEntry).systolic !== undefined;
}

interface ReadingCardProps {
  reading: Reading;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
}

const AttachmentLink: React.FC<{ path: string; name: string; className?: string }> = ({ path, name, className }) => {
    const { t } = useI18n();
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const getSignedUrl = async () => {
            // URLs are valid for 1 hour
            const { data, error } = await supabase.storage
                .from('appointment-attachments')
                .createSignedUrl(path, 3600);

            if (isMounted) {
                if (error) {
                    console.error('Error creating signed URL:', error);
                    setUrl('#'); // Provide a fallback
                } else {
                    setUrl(data.signedUrl);
                }
            }
        };

        if (path) {
            getSignedUrl();
        }

        return () => { isMounted = false; };
    }, [path]);

    if (!url) {
        return <span className="text-sm text-gray-500 animate-pulse">{t('readingCard.generatingLink')}</span>;
    }

    return (
        <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`font-medium break-all underline-offset-4 hover:underline transition-colors ${className}`}
        >
            {name}
        </a>
    );
};

const InfoItem: React.FC<{icon: React.ReactNode, label: string, value: string | React.ReactNode, iconClassName?: string}> = ({ icon, label, value, iconClassName }) => {
    const { t } = useI18n();
    return (
    <div className="flex items-start gap-3">
        <div className={`mt-1 flex-shrink-0 ${iconClassName || 'text-red-500 dark:text-red-400/80'}`}>{icon}</div>
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            {typeof value === 'string' ? (
                 value ? (
                    <p className="text-white font-medium break-words">{value}</p>
                ) : (
                    <p className="text-gray-500 italic">{t('common.notProvided')}</p>
                )
            ) : (
                value
            )}
        </div>
    </div>
)};

const ActionButtons: React.FC<{ onEdit?: () => void; onDelete?: () => void; onShare?: () => void; }> = ({ onEdit, onDelete, onShare }) => {
    const { t } = useI18n();
    return (
    <div className="flex items-center gap-2 flex-shrink-0">
        {onShare && (
            <button
                onClick={onShare}
                className="p-2 rounded-full bg-gray-700/50 dark:bg-gray-800/50 hover:bg-green-500/30 text-gray-400 hover:text-green-400 transition-all duration-300"
                aria-label={t('common.share')}
            >
                <ShareIcon />
            </button>
        )}
        {onEdit && (
            <button
                onClick={onEdit}
                className="p-2 rounded-full bg-gray-700/50 dark:bg-gray-800/50 hover:bg-blue-500/30 text-gray-400 hover:text-blue-400 transition-all duration-300"
                aria-label="Edit reading"
            >
                <EditIcon />
            </button>
        )}
        {onDelete && (
            <button
                onClick={onDelete}
                className="p-2 rounded-full bg-gray-700/50 dark:bg-gray-800/50 hover:bg-red-500/30 text-gray-400 hover:text-red-400 transition-all duration-300"
                aria-label={t('common.delete')}
            >
                <TrashIcon />
            </button>
        )}
    </div>
)};


const ReadingCard: React.FC<ReadingCardProps> = ({ reading, onEdit, onDelete, onShare }) => {
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
        ref.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
        if (!ref.current) return;
        ref.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    };
    
    const formattedDate = formatDate(reading.date);
    
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
            border: 'border-green-900/50',
            bg: 'bg-green-950/40 dark:bg-green-900/30',
            iconContainerBg: 'bg-green-500/20',
            iconColor: 'text-green-500 dark:text-green-400',
            attachmentLink: 'text-green-300 hover:text-green-200'
        },
        default: {
            border: 'border-red-900/50',
            bg: 'bg-gray-900/80 dark:bg-gray-900/60',
            iconContainerBg: 'bg-red-500/20',
            iconColor: 'text-red-500 dark:text-red-400/80',
            attachmentLink: 'text-white hover:text-red-400'
        }
    };

    const currentTheme = isBP ? themeClasses.default : (isAttended ? themeClasses.attended : themeClasses.default);

    const commonCardProps = {
        ref: ref,
        onMouseMove: onEdit ? handleMouseMove : undefined,
        onMouseLeave: onEdit ? handleMouseLeave : undefined,
        style: { transformStyle: 'preserve-3d' as const },
        className: `border rounded-2xl p-6 backdrop-blur-md shadow-lg text-white transition-all duration-200 ease-out ${currentTheme.bg} ${currentTheme.border}`
    };

    if (isBloodPressureEntry(reading)) {
        return (
            <div {...commonCardProps}>
                <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-700/50">
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${currentTheme.iconContainerBg} ${currentTheme.iconColor}`}><BloodPressureIcon className="w-6 h-6" /></div>
                        <h3 className="text-xl font-bold text-white">{t('readingCard.bpTitle')}</h3>
                    </div>
                    <ActionButtons onEdit={onEdit} onDelete={onDelete} onShare={onShare} />
                </div>
                
                <div className="mb-4">
                    <div className={`grid ${reading.pulse ? 'grid-cols-3' : 'grid-cols-2'} gap-4 text-center`}>
                        <div>
                            <p className="text-sm text-gray-400">{t('common.systolic')}</p>
                            <p className="text-3xl sm:text-4xl font-bold text-white">{reading.systolic || 'N/A'}</p>
                            <p className="text-gray-500">{t('readingCard.mmhg')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">{t('common.diastolic')}</p>
                            <p className="text-3xl sm:text-4xl font-bold text-white">{reading.diastolic || 'N/A'}</p>
                            <p className="text-gray-500">{t('readingCard.mmhg')}</p>
                        </div>
                        {reading.pulse && (
                            <div>
                                <p className="text-sm text-gray-400">{t('common.pulse')}</p>
                                <p className="text-3xl sm:text-4xl font-bold text-white">{reading.pulse}</p>
                                <p className="text-gray-500">{t('readingCard.bpm')}</p>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4 pt-4 border-t border-gray-700/50">
                    <InfoItem icon={<CalendarIcon />} label={t('common.date')} value={formattedDate} iconClassName={currentTheme.iconColor} />
                    <InfoItem icon={<ClockIcon />} label={t('common.time')} value={reading.time} iconClassName={currentTheme.iconColor} />
                </div>
            </div>
        );
    }

    return (
        <div {...commonCardProps}>
            <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-700/50">
                <div className="flex items-center gap-4 truncate">
                    <div className={`p-2 rounded-full flex-shrink-0 ${currentTheme.iconContainerBg} ${currentTheme.iconColor}`}><HospitalIcon /></div>
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-white truncate">{reading.hospital || t('common.hospital')}</h3>
                        {isAttended && (
                            <span className="text-xs font-bold bg-green-500/20 text-green-300 px-2.5 py-1 rounded-full flex-shrink-0">
                                {t('common.attended')}
                            </span>
                        )}
                    </div>
                </div>
                 <ActionButtons onEdit={onEdit} onDelete={onDelete} onShare={onShare} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
                <InfoItem icon={<CalendarIcon />} label={t('common.date')} value={formattedDate} iconClassName={currentTheme.iconColor} />
                <InfoItem icon={<ClockIcon />} label={t('common.time')} value={reading.time} iconClassName={currentTheme.iconColor} />
                <InfoItem icon={<DoctorIcon />} label={t('common.doctor')} value={reading.doctor} iconClassName={currentTheme.iconColor} />
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-4">
                <InfoItem icon={<PurposeIcon />} label={t('common.purpose')} value={reading.purpose} iconClassName={currentTheme.iconColor} />
                <InfoItem icon={<NotesIcon />} label={t('common.preNotes')} value={reading.pre_notes} iconClassName={currentTheme.iconColor} />
                <InfoItem icon={<NotesIcon />} label={t('common.postNotes')} value={reading.post_notes} iconClassName={currentTheme.iconColor} />
                
                 <InfoItem 
                    icon={<AttachmentIcon />} 
                    label={t('common.attachments')} 
                    iconClassName={currentTheme.iconColor} 
                    value={
                        (reading.attachments && reading.attachments.length > 0) ? (
                            <ul className="mt-1 space-y-2">
                                {reading.attachments.map((file, index) => (
                                    <li key={index} className="flex items-center">
                                        <AttachmentLink path={file.path} name={file.name} className={currentTheme.attachmentLink} />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 italic">{t('common.notProvided')}</p>
                        )
                    }
                />
            </div>
        </div>
    );
}

export default ReadingCard;
