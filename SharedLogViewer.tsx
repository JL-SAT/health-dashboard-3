
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import ReadingCard from './components/ReadingCard';
import HeartbeatIcon from './components/icons/HeartbeatIcon';
import BackArrowIcon from './components/icons/BackArrowIcon';
import { useI18n } from './i18n/index';

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

interface SharedLogViewerProps {
  uuid?: string;
  uuids?: string;
  onBackToDashboard?: () => void;
}

const processLogData = (logData: any): Reading | null => {
    if (!logData) return null;
    
    if (logData.log_type === 'appointment') {
        const appt = logData;
        const processedAppt: AppointmentEntry = {
            id: appt.id, hospital: appt.hospital, date: appt.date, time: appt.time, doctor: appt.doctor,
            purpose: '', pre_notes: '', post_notes: '', attachments: [],
        };

        if (appt.notes && typeof appt.notes === 'string') {
            try {
                const notesData = JSON.parse(appt.notes);
                if (typeof notesData === 'object' && notesData !== null) {
                    processedAppt.purpose = notesData.purpose || '';
                    processedAppt.pre_notes = notesData.pre_notes || '';
                    processedAppt.post_notes = notesData.post_notes || '';
                    processedAppt.attachments = notesData.attachments || [];
                }
            } catch (e) {
                console.error("Failed to parse appointment notes:", e);
            }
        }
        return processedAppt;
    }
    return logData as BloodPressureEntry;
};

const SharedLogViewer: React.FC<SharedLogViewerProps> = ({ uuid, uuids, onBackToDashboard }) => {
  const { t } = useI18n();
  const [logs, setLogs] = useState<Reading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedLogs = async () => {
        setIsLoading(true);
        setError(null);

        const uuidsToFetch = uuid ? [uuid] : (uuids ? uuids.split(',') : []);

        if (uuidsToFetch.length === 0) {
            setError(t('sharedViewer.error'));
            setIsLoading(false);
            return;
        }

        try {
            const fetchPromises = uuidsToFetch.map(id => 
                supabase.rpc('get_shared_log', { share_id: id })
            );
            const results = await Promise.all(fetchPromises);
            
            const fetchedLogs: Reading[] = [];
            let hasErrors = false;

            for (const result of results) {
                if (result.error) {
                    console.error("Error fetching shared log:", result.error);
                    hasErrors = true;
                } else if (result.data) {
                    const processed = processLogData(result.data);
                    if (processed) {
                        fetchedLogs.push(processed);
                    }
                }
            }

            if (fetchedLogs.length === 0) {
                setError(t('sharedViewer.error'));
            } else if (hasErrors) {
                setError(t('sharedViewer.errorSome'));
            }

            setLogs(fetchedLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (e) {
            console.error("Unexpected error fetching shared logs:", e);
            setError(t('sharedViewer.errorUnexpected'));
        } finally {
            setIsLoading(false);
        }
    };

    fetchSharedLogs();
  }, [uuid, uuids, t]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center text-white">
          <div className="w-16 h-16 mx-auto animate-pulse"><HeartbeatIcon /></div>
          <p className="mt-4 text-lg">{t('sharedViewer.loading')}</p>
        </div>
      );
    }

    if (error) {
        return (
            <div className="text-center text-white p-6 bg-red-900/30 rounded-lg">
              <h2 className="text-2xl font-bold text-red-400">{t('sharedViewer.accessDenied')}</h2>
              <p className="mt-2 text-gray-300">{error}</p>
            </div>
        );
    }
    
    if (logs.length > 0) {
      return (
        <div className="w-full max-w-2xl">
          <div className="space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar pr-2">
            {logs.map((log) => (
                <ReadingCard key={`${log.id}-${log.log_type}`} reading={log} />
            ))}
          </div>
          <div className="text-center mt-4 text-gray-500 text-sm">
              <p>{t('sharedViewer.footer')}</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <main className="h-screen w-full flex flex-col items-center justify-center p-4 font-sans select-none overflow-hidden bg-black relative">
        {onBackToDashboard && (
            <button
                onClick={onBackToDashboard}
                className="absolute top-4 left-4 sm:top-8 sm:left-8 z-20 bg-gray-900/50 border border-gray-500/50 rounded-full p-3 backdrop-blur-sm text-gray-300 hover:text-white transition-all"
                aria-label={t('dashboard.goBack')}
            >
                <BackArrowIcon />
            </button>
        )}
      <div className="absolute inset-0 z-0" style={{
          background: `radial-gradient(ellipse at 25% 25%, rgba(220, 38, 38, 0.2) 0%, transparent 50%),
                       radial-gradient(ellipse at 75% 75%, rgba(220, 38, 38, 0.2) 0%, transparent 50%)`,
          backgroundSize: '200% 200%',
          animation: 'aurora 10s alternate infinite'
      }} />
      <div className="relative z-10">{renderContent()}</div>
    </main>
  );
};

export default SharedLogViewer;
