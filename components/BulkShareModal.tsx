
import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import CloseIcon from './icons/CloseIcon';
import DownloadIcon from './icons/DownloadIcon';
import LinkIcon from './icons/LinkIcon';
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

interface BulkShareModalProps {
    readings: Reading[];
    onClose: () => void;
    isExiting: boolean;
    session: Session;
    onPreview: (uuids: string) => void;
}

const BulkShareModal: React.FC<BulkShareModalProps> = ({ readings, onClose, isExiting, session, onPreview }) => {
    const [tab, setTab] = useState<'pdf' | 'link'>('pdf');
    const [isDownloading, setIsDownloading] = useState(false);
    
    const [customExpirationHours, setCustomExpirationHours] = useState('24');
    const [customExpirationMinutes, setCustomExpirationMinutes] = useState('0');
    const [neverExpires, setNeverExpires] = useState(false);

    const [generatedLink, setGeneratedLink] = useState('');
    const [generatedUuids, setGeneratedUuids] = useState('');
    const [expiration, setExpiration] = useState<string | null>(null);
    const [remainingTime, setRemainingTime] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

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
    
            if (parts.length === 0) setRemainingTime('Expired');
            else setRemainingTime(`in ${parts.join(' ')}`);
        };
    
        updateRemainingTime();
        const interval = setInterval(updateRemainingTime, 1000);
    
        return () => clearInterval(interval);
    }, [expiration, tab]);

    const handleDownloadPdf = async () => {
        setIsDownloading(true);
        setError('');
        let hasError = false;

        try {
            const doc = new jsPDF();

            // HEURISTIC: Check if we are generating a BP report (all readings have systolic property)
            // If strictly BP readings, use the Monthly Grid Format.
            // Otherwise (Mixed or Appointments), use the List Format.
            const bpReadings = readings.filter(r => 'systolic' in r) as BloodPressureEntry[];
            const isBpReport = readings.length > 0 && bpReadings.length === readings.length;

            if (isBpReport) {
                // --- MONTHLY BP REPORT FORMAT ---
                
                // 1. Group by Month-Year
                const groupedByMonth: { [key: string]: BloodPressureEntry[] } = {};
                bpReadings.forEach(reading => {
                    if (!reading.date) return;
                    const d = new Date(reading.date + 'T00:00:00');
                    const key = `${d.getMonth()}-${d.getFullYear()}`; // 0-11, YYYY
                    if (!groupedByMonth[key]) groupedByMonth[key] = [];
                    groupedByMonth[key].push(reading);
                });

                // Sort groups by time (oldest month first)
                const monthKeys = Object.keys(groupedByMonth).sort((a, b) => {
                    const [mA, yA] = a.split('-').map(Number);
                    const [mB, yB] = b.split('-').map(Number);
                    return (yA - yB) || (mA - mB);
                });

                const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                
                // 2. Generate Pages for each Month
                monthKeys.forEach((key, index) => {
                    if (index > 0) doc.addPage();

                    const [monthIdx, year] = key.split('-').map(Number);
                    const monthReadings = groupedByMonth[key];
                    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

                    // Title
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(22);
                    doc.text("Blood Pressure Monthly Report", 105, 20, { align: "center" });
                    
                    doc.setFontSize(14);
                    doc.text(`${monthNames[monthIdx]} ${year}`, 105, 30, { align: "center" });

                    // Table Drawing Config
                    // Compacted rows to fit 31 days on one A4 page
                    const startY = 35;
                    let currentY = startY;
                    const margin = 14;
                    const pageWidth = 210;
                    const tableWidth = pageWidth - (margin * 2);
                    
                    const col1Width = 20; // Date column
                    const col2Width = (tableWidth - col1Width) / 2; // Morning
                    const col3Width = col2Width; // Evening
                    
                    const headerHeight = 8;
                    const rowHeight = 7.5; // Optimized to fit 31 days (232.5mm + header + title fits on 297mm A4)

                    // Helper to draw header
                    const drawHeader = (y: number) => {
                        doc.setFillColor(230, 230, 230); // Light grey background
                        doc.rect(margin, y, tableWidth, headerHeight, 'F');
                        
                        doc.setDrawColor(0); // Black lines
                        doc.setLineWidth(0.1);
                        doc.rect(margin, y, tableWidth, headerHeight, 'S'); // Outer border
                        
                        // Vertical dividers
                        doc.line(margin + col1Width, y, margin + col1Width, y + headerHeight);
                        doc.line(margin + col1Width + col2Width, y, margin + col1Width + col2Width, y + headerHeight);

                        // Text
                        doc.setFont("helvetica", "bold");
                        doc.setFontSize(10);
                        doc.setTextColor(0);
                        
                        // Center text vertically and horizontally
                        doc.text("Date", margin + (col1Width / 2), y + 5.5, { align: "center" });
                        doc.text("Morning (AM)", margin + col1Width + (col2Width / 2), y + 5.5, { align: "center" });
                        doc.text("Evening (PM)", margin + col1Width + col2Width + (col3Width / 2), y + 5.5, { align: "center" });
                    };

                    drawHeader(currentY);
                    currentY += headerHeight;

                    // Draw Rows
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(10);

                    for (let day = 1; day <= daysInMonth; day++) {
                        // Check for page break - Increased threshold
                        if (currentY > 285) {
                            doc.addPage();
                            currentY = 20;
                            drawHeader(currentY);
                            currentY += headerHeight;
                            doc.setFont("helvetica", "normal");
                            doc.setFontSize(10);
                        }

                        // Get readings for specific day
                        const dayReadings = monthReadings.filter(r => {
                            const d = new Date(r.date + 'T00:00:00');
                            return d.getDate() === day;
                        });

                        // Separate AM/PM
                        const morningReadings = dayReadings
                            .filter(r => parseInt(r.time.split(':')[0], 10) < 12)
                            .sort((a, b) => a.time.localeCompare(b.time));
                        
                        const eveningReadings = dayReadings
                            .filter(r => parseInt(r.time.split(':')[0], 10) >= 12)
                            .sort((a, b) => a.time.localeCompare(b.time));

                        // Format Text: SYS/DIA (PUL)
                        const formatBP = (r: BloodPressureEntry) => {
                            const pulseStr = r.pulse ? ` (${r.pulse})` : '';
                            return `${r.systolic}/${r.diastolic}${pulseStr}`;
                        };

                        const morningText = morningReadings.map(formatBP).join(', ');
                        const eveningText = eveningReadings.map(formatBP).join(', ');

                        // Draw Cell Boxes
                        doc.rect(margin, currentY, col1Width, rowHeight);
                        doc.rect(margin + col1Width, currentY, col2Width, rowHeight);
                        doc.rect(margin + col1Width + col2Width, currentY, col3Width, rowHeight);

                        // Draw Text
                        doc.text(String(day), margin + (col1Width / 2), currentY + 5, { align: "center" });
                        
                        // Note: If text is too long, we might need simplistic truncation or multiline logic. 
                        // For typical usage (1-2 readings per slot), standard text fits.
                        if (doc.getTextWidth(morningText) > col2Width - 4) {
                             doc.setFontSize(8);
                             doc.text(morningText, margin + col1Width + (col2Width / 2), currentY + 5, { align: "center" });
                             doc.setFontSize(10);
                        } else {
                             doc.text(morningText, margin + col1Width + (col2Width / 2), currentY + 5, { align: "center" });
                        }

                        if (doc.getTextWidth(eveningText) > col3Width - 4) {
                            doc.setFontSize(8);
                            doc.text(eveningText, margin + col1Width + col2Width + (col3Width / 2), currentY + 5, { align: "center" });
                            doc.setFontSize(10);
                        } else {
                            doc.text(eveningText, margin + col1Width + col2Width + (col3Width / 2), currentY + 5, { align: "center" });
                        }

                        currentY += rowHeight;
                    }
                });
                
                doc.save(`blood-pressure-report.pdf`);

            } else {
                // --- LIST FORMAT (FALLBACK FOR APPOINTMENTS OR MIXED) ---
                let y = 20;

                const checkY = (spaceNeeded: number) => {
                    if (y > 280 - spaceNeeded) {
                        doc.addPage();
                        y = 20;
                    }
                };

                doc.setFont("helvetica", "bold");
                doc.setFontSize(22);
                doc.text("Blood Buddy - Health Logs", 105, y, { align: "center" });
                y += 20;

                for (const [index, reading] of readings.entries()) {
                    checkY(50); 
                    
                    if (index > 0) {
                        doc.setLineWidth(0.2);
                        doc.line(20, y, 190, y);
                        y += 10;
                    }
                    
                    const isBP = 'systolic' in reading;

                    doc.setFontSize(16);
                    doc.text(isBP ? "Blood Pressure Reading" : "Appointment Details", 20, y);
                    doc.setLineWidth(0.5);
                    doc.line(20, y + 2, 190, y + 2);
                    y += 15;

                    const addField = (label: string, value: string) => {
                        if (!value) return;
                        checkY(10);
                        doc.setFont("helvetica", "bold");
                        doc.setFontSize(11);
                        doc.text(label, 20, y);
                        doc.setFont("helvetica", "normal");
                        doc.text(value, 60, y);
                        y += 7;
                    };

                    const addNotes = (label: string, value: string) => {
                        if (!value) return;
                        checkY(15);
                        doc.setFont("helvetica", "bold");
                        doc.setFontSize(11);
                        doc.text(label, 20, y);
                        y += 6;
                        doc.setFont("helvetica", "normal");
                        const splitText = doc.splitTextToSize(value, 170);
                        checkY(splitText.length * 5);
                        doc.text(splitText, 20, y);
                        y += splitText.length * 5 + 3;
                    };

                    const formattedDate = reading.date ? new Date(reading.date + 'T00:00:00').toLocaleDateString(undefined, {
                    year: 'numeric', month: 'long', day: 'numeric'
                    }) : 'N/A';

                    addField("Date:", formattedDate);
                    addField("Time:", reading.time || 'N/A');
                    y += 3;

                    if (isBP) {
                        const bpReading = reading as BloodPressureEntry;
                        addField("Systolic:", `${bpReading.systolic} mmHg`);
                        addField("Diastolic:", `${bpReading.diastolic} mmHg`);
                        if (bpReading.pulse) {
                            addField("Pulse:", `${bpReading.pulse} bpm`);
                        }
                    } else {
                        const apptReading = reading as AppointmentEntry;
                        addField("Hospital:", apptReading.hospital);
                        addField("Doctor:", apptReading.doctor);
                        addNotes("Purpose:", apptReading.purpose);
                        addNotes("Pre-Appointment Notes:", apptReading.pre_notes);
                        addNotes("Post-Appointment Notes:", apptReading.post_notes);

                        if (apptReading.attachments && apptReading.attachments.length > 0) {
                            checkY(15);
                            y += 5;
                            doc.setFont("helvetica", "bold");
                            doc.setFontSize(11);
                            doc.text("Attachments:", 20, y);
                            doc.setFont("helvetica", "normal");
                            y += 7;
                            
                            for (const attachment of apptReading.attachments) {
                                checkY(7);
                                const { data, error: urlError } = await supabase.storage
                                    .from('appointment-attachments')
                                    .createSignedUrl(attachment.path, 3600);

                                if (urlError || !data) {
                                    console.error("Error getting signed URL for attachment:", urlError);
                                    doc.text(`- ${attachment.name} (Link unavailable)`, 25, y);
                                } else {
                                    doc.setTextColor(45, 102, 196);
                                    doc.textWithLink(attachment.name, 25, y, { url: data.signedUrl });
                                    doc.setTextColor(0, 0, 0);
                                }
                                y += 7;
                            }
                        }
                    }
                }
                
                doc.save(`health-logs-export.pdf`);
            }
        } catch (e) {
            console.error("Error generating PDF:", e);
            setError("Sorry, an error occurred while generating the PDF.");
            hasError = true;
        } finally {
            setIsDownloading(false);
            if (!hasError) {
                onClose();
            }
        }
    };

    const handleGenerateLink = async () => {
        setIsLoading(true);
        setError('');

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

        const recordsToInsert = readings.map(reading => ({
            user_id: session.user.id,
            log_id: reading.id,
            log_type: 'systolic' in reading ? 'blood_pressure' : 'appointment',
            expires_at: expires_at,
        }));

        const { data, error: insertError } = await supabase
            .from('shared_logs')
            .insert(recordsToInsert)
            .select('id');

        if (insertError) {
            console.error('Error creating share links:', insertError.message);
            setError(`Failed to create link: ${insertError.message}`);
        } else if (data) {
            const uuids = data.map(item => item.id).join(',');
            const baseUrl = `${window.location.origin}${window.location.pathname}`;
            const shareUrl = new URL(baseUrl);
            shareUrl.searchParams.set('share_bulk', uuids);
            
            setGeneratedLink(shareUrl.toString());
            setGeneratedUuids(uuids);
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
        if (generatedUuids) {
            onPreview(generatedUuids);
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
                        <input type="text" value={generatedLink} readOnly className="flex-grow bg-transparent text-gray-300 text-sm focus:outline-none" />
                        <button onClick={handlePreview} className="p-2 rounded-md bg-gray-600/50 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors flex-shrink-0" aria-label="Preview link"><EyeIcon /></button>
                        <button onClick={handleCopyToClipboard} className="p-2 rounded-md bg-gray-600/50 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors flex-shrink-0" aria-label="Copy to clipboard">
                            {copied ? <span className="text-xs text-green-400">Copied!</span> : <ClipboardIcon />}
                        </button>
                    </div>
                    <div className="text-center text-sm text-gray-400 mt-2">
                        <span>Expires </span><span className="font-semibold text-gray-300">{remainingTime}</span>
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
                            <div className="flex items-center gap-2"><input type="number" min="0" value={customExpirationHours} onChange={e => setCustomExpirationHours(e.target.value)} disabled={neverExpires} className="w-16 p-2 bg-gray-700/80 border border-gray-600/50 rounded-md text-white disabled:opacity-50 text-center" placeholder="24" /><span className="text-gray-400 text-sm">hours</span></div>
                            <div className="flex items-center gap-2"><input type="number" min="0" max="59" value={customExpirationMinutes} onChange={e => setCustomExpirationMinutes(e.target.value)} disabled={neverExpires} className="w-16 p-2 bg-gray-700/80 border border-gray-600/50 rounded-md text-white disabled:opacity-50 text-center" placeholder="0" /><span className="text-gray-400 text-sm">minutes</span></div>
                        </div>
                        <div className="flex items-center sm:border-l border-gray-600/50 sm:pl-4"><input type="checkbox" id="never-expires-bulk" checked={neverExpires} onChange={e => setNeverExpires(e.target.checked)} className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-red-500 focus:ring-red-500 cursor-pointer" /><label htmlFor="never-expires-bulk" className="ml-2 text-sm text-gray-300 cursor-pointer">Never expires</label></div>
                    </div>
                </div>
                <button onClick={handleGenerateLink} disabled={isLoading} className="w-full flex justify-center py-2 px-4 mt-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 disabled:opacity-50">{isLoading ? 'Please wait...' : 'Generate Link'}</button>
            </>
        );
    };

    const renderPdfContent = () => (
        <>
            <p className="text-center text-gray-300 mb-6">
                {readings.length > 0 && 'systolic' in readings[0] 
                    ? "A Monthly Blood Pressure Report PDF will be generated." 
                    : `A single PDF containing all ${readings.length} selected health logs will be generated.`
                }
            </p>
            <button onClick={handleDownloadPdf} disabled={isDownloading} className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 disabled:opacity-50">
                {isDownloading ? 'Generating...' : (<><DownloadIcon className="w-5 h-5" /><span>Download as PDF</span></>)}
            </button>
        </>
    );

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-[2px] p-4 ${isExiting ? 'animate-modal-overlay-exit' : 'animate-modal-overlay-enter'}`}
            aria-modal="true"
            role="dialog"
        >
            <div
                className={`bg-gray-900/95 dark:bg-gray-800/95 border border-red-500/10 rounded-lg shadow-2xl p-6 relative w-full max-w-lg text-gray-200 mx-4 sm:mx-0 ${isExiting ? 'animate-modal-exit' : 'animate-modal-enter'}`}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors" aria-label="Close modal"><CloseIcon /></button>
                <h2 className="text-2xl font-bold mb-4 text-white">Share Multiple Logs</h2>
                
                <div className="flex bg-gray-900/50 rounded-t-md">
                    <TabButton isActive={tab === 'pdf'} onClick={() => setTab('pdf')}><div className="flex items-center justify-center gap-2"><DownloadIcon className="w-5 h-5" /> Download as PDF</div></TabButton>
                    <TabButton isActive={tab === 'link'} onClick={() => setTab('link')}><div className="flex items-center justify-center gap-2"><LinkIcon className="w-5 h-5" /> Share Link</div></TabButton>
                </div>
                
                <div className="bg-gray-700/80 p-4 rounded-b-md">
                    {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
                    {tab === 'pdf' ? renderPdfContent() : renderLinkContent()}
                </div>
            </div>
        </div>
    );
};

export default BulkShareModal;
