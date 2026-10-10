import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { jsPDF } from 'jspdf';
import CloseIcon from './icons/CloseIcon';
import LinkIcon from './icons/LinkIcon';
import DownloadIcon from './icons/DownloadIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import EyeIcon from './icons/EyeIcon';

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

interface ShareModalProps {
    reading: Reading;
    onClose: () => void;
    isExiting: boolean;
    session: Session;
    onPreview: (uuid: string) => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ reading, onClose, isExiting, session, onPreview }) => {
    const [tab, setTab] = useState<'link' | 'pdf'>('link');
    
    const [customExpirationHours, setCustomExpirationHours] = useState('24');
    const [customExpirationMinutes, setCustomExpirationMinutes] = useState('0');
    const [neverExpires, setNeverExpires] = useState(false);

    const [generatedLink, setGeneratedLink] = useState('');
    const [generatedUuid, setGeneratedUuid] = useState('');
    const [expiration, setExpiration] = useState<string | null>(null);
    const [remainingTime, setRemainingTime] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (tab !== 'link' || !expiration) {
            setRemainingTime('Never');
            return;
        }
    
        const updateRemainingTime = () => {
            const expirationDate = new Date(expiration);
            const now = new Date();
            let diffMs = expirationDate.getTime() - now.getTime();
    
            if (diffMs <= 0) {
                setRemainingTime('Expired');
                return;
            }
    
            const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            diffMs -= days * (1000 * 60 * 60 * 24);
    
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            diffMs -= hours * (1000 * 60 * 60);
    
            const minutes = Math.floor(diffMs / (1000 * 60));
            diffMs -= minutes * (1000 * 60);

            const seconds = Math.floor(diffMs / 1000);
    
            const parts = [];
            if (days > 0) parts.push(`${days}d`);
            if (hours > 0) parts.push(`${hours}h`);
            if (minutes > 0) parts.push(`${minutes}m`);
            if (days === 0 && hours === 0 && minutes < 1) parts.push(`${seconds}s`);
    
            if (parts.length === 0) {
                setRemainingTime('Expired');
            } else {
                setRemainingTime(`in ${parts.join(' ')}`);
            }
        };
    
        updateRemainingTime();
        const interval = setInterval(updateRemainingTime, 1000);
    
        return () => clearInterval(interval);
    }, [expiration, tab]);

    const handleDownloadPdf = async () => {
        setIsDownloading(true);
        setError('');
        try {
            const doc = new jsPDF();
            const isBP = 'systolic' in reading;

            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.text("Blood Buddy - Health Log", 105, 20, { align: "center" });

            doc.setFontSize(16);
            doc.text(isBP ? "Blood Pressure Reading" : "Appointment Details", 20, 40);
            doc.setLineWidth(0.5);
            doc.line(20, 42, 190, 42);

            let y = 55;
            
            const addField = (label: string, value: string) => {
                if (!value) return;
                if (y > 270) { doc.addPage(); y = 20; }
                doc.setFont("helvetica", "bold");
                doc.text(label, 20, y);
                doc.setFont("helvetica", "normal");
                doc.text(value, 60, y);
                y += 10;
            };

            const addNotes = (label: string, value: string) => {
                if (!value) return;
                if (y > 270) { doc.addPage(); y = 20; }
                doc.setFont("helvetica", "bold");
                doc.text(label, 20, y);
                y += 7;
                doc.setFont("helvetica", "normal");
                const splitText = doc.splitTextToSize(value, 170);
                if (y + (splitText.length * 5) > 280) { doc.addPage(); y = 20; }
                doc.text(splitText, 20, y);
                y += splitText.length * 5 + 5;
            };

            const formattedDate = reading.date ? new Date(reading.date + 'T00:00:00').toLocaleDateString(undefined, {
              year: 'numeric', month: 'long', day: 'numeric'
            }) : 'N/A';

            addField("Date:", formattedDate);
            addField("Time:", reading.time || 'N/A');

            if (isBP) {
                const bpReading = reading as BloodPressureEntry;
                y += 5;
                addField("Systolic:", `${bpReading.systolic} mmHg`);
                addField("Diastolic:", `${bpReading.diastolic} mmHg`);
                if (bpReading.pulse) {
                    addField("Pulse:", `${bpReading.pulse} bpm`);
                }
            } else {
                const apptReading = reading as AppointmentEntry;
                y += 5;
                addField("Hospital:", apptReading.hospital);
                addField("Doctor:", apptReading.doctor);
                addNotes("Purpose:", apptReading.purpose);
                y += 5;
                addNotes("Pre-Appointment Notes:", apptReading.pre_notes);
                y += 5;
                addNotes("Post-Appointment Notes:", apptReading.post_notes);

                if (apptReading.attachments && apptReading.attachments.length > 0) {
                    if (y > 260) { doc.addPage(); y = 20; }
                    y += 10;
                    doc.setFont("helvetica", "bold");
                    doc.text("Attachments:", 20, y);
                    doc.setFont("helvetica", "normal");
                    y += 10;
                    
                    for (const attachment of apptReading.attachments) {
                        if (y > 270) { doc.addPage(); y = 20; }

                        const { data, error: urlError } = await supabase.storage
                            .from('appointment-attachments')
                            .createSignedUrl(attachment.path, 3600); // 1 hour expiration

                        if (urlError || !data) {
                            console.error("Error getting signed URL for attachment:", urlError);
                            doc.text(`- ${attachment.name} (Link unavailable)`, 25, y);
                        } else {
                            doc.setTextColor(45, 102, 196); // A pleasant blue for links
                            doc.textWithLink(attachment.name, 25, y, { url: data.signedUrl });
                            doc.setTextColor(0, 0, 0); // Reset to black
                        }
                        y += 7;
                    }
                }
            }
            
            doc.save(`health-log-${reading.id}.pdf`);
        } catch (e) {
            console.error("Error generating PDF:", e);
            setError("Sorry, an error occurred while generating the PDF.");
        } finally {
            setIsDownloading(false);
            if (!error) {
                onClose();
            }
        }
    };

    const handleGenerateLink = async () => {
        setIsLoading(true);
        setError('');

        const logType = 'systolic' in reading ? 'blood_pressure' : 'appointment';

        // Expire any existing links for this log to ensure only one is active.
        await supabase
            .from('shared_logs')
            .update({ expires_at: new Date().toISOString() })
            .match({
                log_id: reading.id,
                log_type: logType,
                user_id: session.user.id,
            });

        let expires_at: string | null = null;
        if (!neverExpires) {
            const hours = parseInt(customExpirationHours, 10) || 0;
            const minutes = parseInt(customExpirationMinutes, 10) || 0;

            if (hours < 0 || minutes < 0 || (hours === 0 && minutes === 0)) {
                setError('Please enter a valid, non-zero duration.');
                setIsLoading(false);
                return;
            }

            const now = new Date();
            now.setHours(now.getHours() + hours);
            now.setMinutes(now.getMinutes() + minutes);
            expires_at = now.toISOString();
        }

        const { data, error: insertError } = await supabase
            .from('shared_logs')
            .insert({
                user_id: session.user.id,
                log_id: reading.id,
                log_type: logType,
                expires_at: expires_at,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error creating share link:', insertError.message);
            setError(`Failed to create link: ${insertError.message}`);
        } else if (data) {
            const baseUrl = `${window.location.origin}${window.location.pathname}`;
            const shareUrl = new URL(baseUrl);
            shareUrl.searchParams.set('share', data.id);
            setGeneratedLink(shareUrl.toString());
            setGeneratedUuid(data.id);
            setExpiration(expires_at);
        }
        setIsLoading(false);
    };
    
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    const handlePreview = () => {
        if (generatedUuid) {
            onPreview(generatedUuid);
        }
    };

    const TabButton: React.FC<{ isActive: boolean, onClick: () => void, children: React.ReactNode }> = ({ isActive, onClick, children }) => (
        <button
            onClick={onClick}
            className={`flex-1 p-3 text-sm font-bold rounded-t-md transition-all ${
                isActive 
                ? 'bg-gray-700/80 text-white' 
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
        >
            {children}
        </button>
    );

    const renderLinkContent = () => {
        if (isLoading) {
            return <div className="text-center p-8 text-gray-400">Generating link...</div>;
        }

        if (generatedLink) {
            return (
                <div className="mt-4 animate-card-enter opacity-0" style={{ animationFillMode: 'forwards' }}>
                    <p className="text-sm text-gray-300 mb-2">Your secure link is ready:</p>
                    <div className="flex items-center gap-2 bg-gray-800/80 p-2 rounded-md border border-gray-600/50">
                        <input
                            type="text"
                            value={generatedLink}
                            readOnly
                            className="flex-grow bg-transparent text-gray-300 text-sm focus:outline-none"
                        />
                        <button
                            onClick={handlePreview}
                            className="p-2 rounded-md bg-gray-600/50 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors flex-shrink-0"
                            aria-label="Preview link"
                        >
                            <EyeIcon />
                        </button>
                        <button
                            onClick={handleCopyToClipboard}
                            className="p-2 rounded-md bg-gray-600/50 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors flex-shrink-0"
                            aria-label="Copy to clipboard"
                        >
                            {copied ? <span className="text-xs text-green-400">Copied!</span> : <ClipboardIcon />}
                        </button>
                    </div>
                    <div className="text-center text-sm text-gray-400 mt-2">
                        <span>Expires </span>
                        <span className="font-semibold text-gray-300">
                            {remainingTime}
                        </span>
                    </div>
                </div>
            );
        }

        return (
            <>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Link Expiration</label>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-800/50 p-3 rounded-md">
                        <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    min="0"
                                    value={customExpirationHours}
                                    onChange={e => setCustomExpirationHours(e.target.value)}
                                    disabled={neverExpires}
                                    className="w-16 p-2 bg-gray-700/80 border border-gray-600/50 rounded-md text-white disabled:opacity-50 text-center"
                                    placeholder="24"
                                />
                                <span className="text-gray-400 text-sm">hours</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    min="0"
                                    max="59"
                                    value={customExpirationMinutes}
                                    onChange={e => setCustomExpirationMinutes(e.target.value)}
                                    disabled={neverExpires}
                                    className="w-16 p-2 bg-gray-700/80 border border-gray-600/50 rounded-md text-white disabled:opacity-50 text-center"
                                    placeholder="0"
                                />
                                <span className="text-gray-400 text-sm">minutes</span>
                            </div>
                        </div>
                        <div className="flex items-center sm:border-l border-gray-600/50 sm:pl-4">
                            <input 
                                type="checkbox" 
                                id="never-expires" 
                                checked={neverExpires}
                                onChange={e => setNeverExpires(e.target.checked)}
                                className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-red-500 focus:ring-red-500 cursor-pointer"
                            />
                            <label htmlFor="never-expires" className="ml-2 text-sm text-gray-300 cursor-pointer">Never expires</label>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleGenerateLink}
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 mt-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 disabled:opacity-50"
                >
                    {isLoading ? 'Please wait...' : 'Generate Link'}
                </button>
            </>
        );
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-[2px] p-4 ${isExiting ? 'animate-modal-overlay-exit' : 'animate-modal-overlay-enter'}`}
            aria-modal="true"
            role="dialog"
        >
            <div
                className={`bg-gray-900/95 dark:bg-gray-800/95 border border-red-500/10 rounded-lg shadow-2xl p-6 relative w-full max-w-md text-gray-200 mx-4 sm:mx-0 ${isExiting ? 'animate-modal-exit' : 'animate-modal-enter'}`}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close modal"
                >
                    <CloseIcon />
                </button>
                <h2 className="text-2xl font-bold mb-4 text-white">Share Health Log</h2>
                
                <div className="flex bg-gray-900/50 rounded-t-md">
                    <TabButton isActive={tab === 'link'} onClick={() => setTab('link')}>
                        <div className="flex items-center justify-center gap-2"><LinkIcon className="w-5 h-5" /> Share Link</div>
                    </TabButton>
                    <TabButton isActive={tab === 'pdf'} onClick={() => setTab('pdf')}>
                        <div className="flex items-center justify-center gap-2"><DownloadIcon className="w-5 h-5" /> Download as PDF</div>
                    </TabButton>
                </div>

                <div className="bg-gray-700/80 p-4 rounded-b-md">
                    {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
                    {tab === 'link' ? renderLinkContent() : (
                         <>
                            <p className="text-center text-gray-300 mb-6">
                                A PDF of this health log will be generated and downloaded to your device.
                            </p>
                             <button
                                onClick={handleDownloadPdf}
                                disabled={isDownloading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 disabled:opacity-50"
                            >
                                {isDownloading ? 'Generating...' : (
                                    <div className="flex items-center justify-center gap-2">
                                        <DownloadIcon className="w-5 h-5" /> Download as PDF
                                    </div>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareModal;