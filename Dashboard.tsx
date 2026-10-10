
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';
import { GoogleGenAI, Type } from '@google/genai';
import DashboardButton from './components/DashboardButton';
import BloodPressureIcon from './components/icons/BloodPressureIcon';
import AppointmentsIcon from './components/icons/AppointmentsIcon';
import BackArrowIcon from './components/icons/BackArrowIcon';
import PlusIcon from './components/icons/PlusIcon';
import CloseIcon from './components/icons/CloseIcon';
import ReadingCard from './components/ReadingCard';
import CompactReadingCard from './components/CompactReadingCard';
import SunIcon from './components/icons/SunIcon';
import MoonIcon from './components/icons/MoonIcon';
import LogoutIcon from './components/icons/LogoutIcon';
import TrashIcon from './components/icons/TrashIcon';
import { AttachmentIcon, CalendarIcon } from './components/icons/InfoIcons';
import SearchIcon from './components/icons/SearchIcon';
import CameraIcon from './components/icons/CameraIcon';
import ShareModal from './components/ShareModal';
import BulkShareModal from './components/BulkShareModal';
import ShareIcon from './components/icons/ShareIcon';
import ReportIcon from './components/icons/ReportIcon';
import HeartbeatIcon from './components/icons/HeartbeatIcon';
import { useI18n } from './i18n/index';
import LanguageSwitcher from './components/LanguageSwitcher';

// Initialize the Gemini AI client. Assumes API_KEY is set in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// ... (interfaces remain the same)
interface BloodPressureEntry {
  id: number;
  systolic: string;
  diastolic: string;
  pulse: string;
  date: string;
  time: string;
  created_at: string;
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
  created_at: string;
}

type Reading = BloodPressureEntry | AppointmentEntry;

interface DashboardProps {
    session: Session;
    onPreviewLink: (uuid: string) => void;
    onPreviewLinks: (uuids: string) => void;
    onViewOverview?: () => void;
}

const ITEMS_PER_PAGE = 5;

type SortOption = 'created_at_desc' | 'created_at_asc' | 'date_desc' | 'date_asc';

const Dashboard: React.FC<DashboardProps> = ({ session, onPreviewLink, onPreviewLinks, onViewOverview }) => {
  const { t, language } = useI18n();
  // ... (rest of the state and logic remains identical up to renderPageContent)
  const [page, setPage] = useState('main_dashboard');
  const [isExiting, setIsExiting] = useState(false);
  
  const [modalContent, setModalContent] = useState<'blood-pressure' | 'appointment' | null>(null);
  const [isModalExiting, setIsModalExiting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDetailModalExiting, setIsDetailModalExiting] = useState(false);
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isShareModalExiting, setIsShareModalExiting] = useState(false);
  const [readingToShare, setReadingToShare] = useState<Reading | null>(null);
  
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleteConfirmExiting, setIsDeleteConfirmExiting] = useState(false);
  const [readingToDeleteId, setReadingToDeleteId] = useState<number | null>(null);
  const [deletingReadingId, setDeletingReadingId] = useState<number | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  // State for multi-select and bulk actions
  const [isSelectionModeActive, setIsSelectionModeActive] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkShareModalOpen, setIsBulkShareModalOpen] = useState(false);
  const [isBulkShareModalExiting, setIsBulkShareModalExiting] = useState(false);
  const [readingsToShare, setReadingsToShare] = useState<Reading[]>([]);
  
  // State for Report Selection
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReportModalExiting, setIsReportModalExiting] = useState(false);
  const [reportMonth, setReportMonth] = useState('');
  const [reportYear, setReportYear] = useState('');
  const [reportError, setReportError] = useState('');
  
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarDisplayDate, setCalendarDisplayDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'days' | 'years'>('days');

  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [timePickerView, setTimePickerView] = useState<'hours' | 'minutes'>('hours');

  const [formData, setFormData] = useState({
    systolic: '',
    diastolic: '',
    pulse: '',
    hospital: '',
    date: '',
    time: '',
    doctor: '',
    purpose: '',
    pre_notes: '',
    post_notes: '',
    attachments: [] as { name: string; path: string }[],
  });
  
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [attachmentsToDelete, setAttachmentsToDelete] = useState<string[]>([]);
  
  // State for AI image analysis feature
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const diastolicInputRef = useRef<HTMLInputElement>(null);
  const pulseInputRef = useRef<HTMLInputElement>(null);

  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    return 'dark';
  });

  const [bloodPressureReadings, setBloodPressureReadings] = useState<BloodPressureEntry[]>([]);
  const [appointments, setAppointments] = useState<AppointmentEntry[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [bpCurrentPage, setBpCurrentPage] = useState(1);
  const [apptCurrentPage, setApptCurrentPage] = useState(1);
  
  const [editingPageFor, setEditingPageFor] = useState<'bp' | 'appt' | null>(null);
  const [pageInput, setPageInput] = useState('');
  
  const [bpSearchDay, setBpSearchDay] = useState('');
  const [bpSearchMonth, setBpSearchMonth] = useState('');
  const [bpSearchYear, setBpSearchYear] = useState('');
  const [appointmentSearchQuery, setAppointmentSearchQuery] = useState('');
  const [apptSearchDay, setApptSearchDay] = useState('');
  const [apptSearchMonth, setApptSearchMonth] = useState('');
  const [apptSearchYear, setApptSearchYear] = useState('');
  
  const [bpSortOption, setBpSortOption] = useState<SortOption>('date_desc');
  const [apptSortOption, setApptSortOption] = useState<SortOption>('date_desc');

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i), [currentYear]);
  const monthNames = useMemo(() => ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    window.localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
    setBpCurrentPage(1);
  }, [bpSearchDay, bpSearchMonth, bpSearchYear, bpSortOption]);
  
  useEffect(() => {
    setApptCurrentPage(1);
  }, [appointmentSearchQuery, apptSearchDay, apptSearchMonth, apptSearchYear, apptSortOption]);

  useEffect(() => {
    setIsSelectionModeActive(false);
    setSelectedIds([]);
  }, [page]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const onLogout = () => supabase.auth.signOut();

  async function fetchReadings() {
    setIsLoadingData(true);
    const { data: bpData, error: bpError } = await supabase
      .from('blood_pressure_readings')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (bpError) {
      console.error('Error fetching blood pressure readings:', bpError);
    } else {
      setBloodPressureReadings(bpData as BloodPressureEntry[]);
    }

    const { data: apptData, error: apptError } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (apptError) {
      console.error('Error fetching appointments:', apptError.message);
    } else {
      const processedAppointments = (apptData || []).map(appt => {
        const processedAppt: AppointmentEntry = {
            id: appt.id,
            hospital: appt.hospital,
            date: appt.date,
            time: appt.time,
            doctor: appt.doctor,
            purpose: '',
            pre_notes: '',
            post_notes: '',
            attachments: [],
            created_at: appt.created_at,
        };
    
        if (appt.notes && typeof appt.notes === 'string') {
          try {
            const notesData = JSON.parse(appt.notes);
            if (typeof notesData === 'object' && notesData !== null) {
                processedAppt.purpose = notesData.purpose || '';
                processedAppt.pre_notes = notesData.pre_notes || '';
                processedAppt.post_notes = notesData.post_notes || '';
                processedAppt.attachments = notesData.attachments || [];
            } else {
              processedAppt.pre_notes = String(notesData);
            }
          } catch (e) {
            processedAppt.pre_notes = appt.notes;
          }
        }
        return processedAppt;
      });
      setAppointments(processedAppointments);
    }
    setIsLoadingData(false);
  }

  useEffect(() => {
    fetchReadings();
  }, [session.user.id]);

  const navigateTo = (targetPage: string) => {
    if (isExiting || page === targetPage) return;

    setIsExiting(true);
    setTimeout(() => {
      setPage(targetPage);
      setIsExiting(false);
    }, 200);
  };

  const openModal = (type: 'blood-pressure' | 'appointment', isEditing = false) => {
    if (isModalExiting) return;

    if (!isEditing) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentDate = `${year}-${month}-${day}`;
      const currentTime = `${hours}:${minutes}`;

      setFormData({
        systolic: '', diastolic: '', pulse: '', hospital: '',
        date: currentDate, time: currentTime,
        doctor: '', purpose: '', pre_notes: '', post_notes: '',
        attachments: [],
      });
    }
    
    setModalContent(type);
  };

  const closeModal = () => {
    if (!modalContent) return;
    setIsModalExiting(true);
    setTimeout(() => {
      setModalContent(null);
      setIsModalExiting(false);
      setEditingId(null);
      setFormData({ 
        systolic: '', diastolic: '', pulse: '', hospital: '', date: '',
        time: '', doctor: '', purpose: '', pre_notes: '', post_notes: '',
        attachments: [],
      });
      setNewFiles([]);
      setAttachmentsToDelete([]);
      if (isSubmittingRef.current) {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(null);
      setIsAnalyzing(false);
      setAiError(null);
    }, 200);
  };

  const openDetailModal = (reading: Reading) => {
    if (isDetailModalExiting || isSelectionModeActive) return;
    setSelectedReading(reading);
    setIsDetailModalOpen(true);
  };
  
  const closeDetailModal = () => {
    if (!isDetailModalOpen) return;
    setIsDetailModalExiting(true);
    setTimeout(() => {
        setIsDetailModalOpen(false);
        setIsDetailModalExiting(false);
        setSelectedReading(null);
    }, 200);
  };

  const openShareModal = (reading: Reading) => {
    if (isShareModalExiting) return;
    setReadingToShare(reading as Reading);
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    if (!isShareModalOpen) return;
    setIsShareModalExiting(true);
    setTimeout(() => {
        setIsShareModalOpen(false);
        setIsShareModalExiting(false);
        setReadingToShare(null);
    }, 200);
  };
  
  const handleDeleteReading = (id: number) => {
    setReadingToDeleteId(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleStartEdit = (reading: Reading) => {
    const isBP = 'systolic' in reading;
    setEditingId(reading.id);
  
    const emptyForm = {
      systolic: '', diastolic: '', pulse: '', hospital: '',
      date: '', time: '', doctor: '', purpose: '',
      pre_notes: '', post_notes: '', attachments: [],
    };
  
    const readingData = {
      ...emptyForm,
      date: reading.date,
      time: reading.time,
      ...(isBP ? {
        systolic: reading.systolic,
        diastolic: reading.diastolic,
        pulse: reading.pulse,
      } : {
        hospital: reading.hospital,
        doctor: reading.doctor,
        purpose: reading.purpose,
        pre_notes: reading.pre_notes,
        post_notes: reading.post_notes,
        attachments: reading.attachments || [],
      })
    };
  
    setFormData(readingData);
    setNewFiles([]);
    setAttachmentsToDelete([]);
    openModal(isBP ? 'blood-pressure' : 'appointment', true);
  };
  
  // ... (delete logic and other handlers remain the same)
  const confirmDelete = async () => {
    const isBulkDelete = readingToDeleteId === -1;
    const idsToDelete = isBulkDelete ? selectedIds : (readingToDeleteId ? [readingToDeleteId] : []);
    
    if (idsToDelete.length === 0) {
        closeDeleteConfirm();
        return;
    }

    if (!isBulkDelete && readingToDeleteId) {
        setDeletingReadingId(readingToDeleteId);
    }
    
    closeDeleteConfirm();
    
    const table = page === 'blood-pressure' ? 'blood_pressure_readings' : 'appointments';

    if (table === 'appointments' && idsToDelete.length > 0) {
        const { data: appointmentsToDelete, error: fetchError } = await supabase
            .from('appointments')
            .select('id, notes')
            .in('id', idsToDelete as number[]);

        if (fetchError) {
            console.error("Error fetching appointments for deletion:", fetchError);
            return;
        }

        const attachmentPaths = (appointmentsToDelete || [])
            .flatMap(appt => {
                if (!appt.notes || typeof appt.notes !== 'string') return [];
                try {
                    const notesData = JSON.parse(appt.notes);
                    return notesData.attachments?.map((att: { path: string }) => att.path) || [];
                } catch { return []; }
            })
            .filter(Boolean);
        
        if (attachmentPaths.length > 0) {
            const { error: deleteError } = await supabase.storage
                .from('appointment-attachments')
                .remove(attachmentPaths);
            if (deleteError) console.error("Error deleting appointment attachments:", deleteError);
        }
    }

    const { error } = await supabase.from(table).delete().in('id', idsToDelete as number[]);

    if (error) {
        console.error('Error deleting reading(s):', error);
        if (isBulkDelete) {
            setIsSelectionModeActive(false);
            setSelectedIds([]);
        } else {
            setDeletingReadingId(null);
        }
    } else {
        const postDeleteAction = () => {
            if (page === 'blood-pressure') {
                setBloodPressureReadings(prev => {
                    const newReadings = prev.filter(r => !idsToDelete.includes(r.id));
                    const newTotalPages = Math.ceil(newReadings.length / ITEMS_PER_PAGE);
                    if (bpCurrentPage > newTotalPages) setBpCurrentPage(newTotalPages || 1);
                    return newReadings;
                });
            } else if (page === 'appointments') {
                setAppointments(prev => {
                    const newAppointments = prev.filter(a => !idsToDelete.includes(a.id));
                    const newTotalPages = Math.ceil(newAppointments.length / ITEMS_PER_PAGE);
                    if (apptCurrentPage > newTotalPages) setApptCurrentPage(newTotalPages || 1);
                    return newAppointments;
                });
            }

            if (isBulkDelete) {
                setIsSelectionModeActive(false);
                setSelectedIds([]);
            } else {
                setDeletingReadingId(null);
            }
        };

        if (isBulkDelete) {
            postDeleteAction();
        } else {
            setTimeout(postDeleteAction, 500);
        }
    }
  };

  const closeDeleteConfirm = () => {
    if (!isDeleteConfirmOpen) return;
    setIsDeleteConfirmExiting(true);
    setTimeout(() => {
        setIsDeleteConfirmOpen(false);
        setIsDeleteConfirmExiting(false);
        setReadingToDeleteId(null);
    }, 200);
  };

  const toggleSelectionMode = () => {
    setIsSelectionModeActive(prev => !prev);
    setSelectedIds([]);
  };

  const handleToggleSelectId = (id: number) => {
    setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };
  
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setReadingToDeleteId(-1);
    setIsDeleteConfirmOpen(true);
  };
  
  const openBulkShareModal = (readings: Reading[]) => {
    if (isBulkShareModalExiting) return;
    setReadingsToShare(readings);
    setIsBulkShareModalOpen(true);
  };
  
  const closeBulkShareModal = () => {
    if (!isBulkShareModalOpen) return;
    setIsBulkShareModalExiting(true);
    setTimeout(() => {
        setIsBulkShareModalOpen(false);
        setIsBulkShareModalExiting(false);
        setReadingsToShare([]);
    }, 200);
  };

  const handleBulkShare = () => {
    if (selectedIds.length === 0) return;
    const allReadings = page === 'blood-pressure' ? sortedBloodPressureReadings : sortedAppointments;
    const selectedReadings = allReadings.filter(r => selectedIds.includes(r.id));
    openBulkShareModal(selectedReadings);
  };
  
  const handleCreateReport = () => {
    const now = new Date();
    setReportMonth(String(now.getMonth() + 1));
    setReportYear(String(now.getFullYear()));
    setReportError('');
    setIsReportModalOpen(true);
  };

  const closeReportModal = () => {
    if (!isReportModalOpen) return;
    setIsReportModalExiting(true);
    setTimeout(() => {
        setIsReportModalOpen(false);
        setIsReportModalExiting(false);
        setReportError('');
    }, 200);
  };

  const handleProceedToReport = () => {
    if (!reportMonth || !reportYear) return;

    const month = parseInt(reportMonth, 10);
    const year = parseInt(reportYear, 10);

    const filtered = bloodPressureReadings.filter(r => {
        if (!r.date) return false;
        const d = new Date(r.date + 'T00:00:00');
        if (isNaN(d.getTime())) return false;
        return d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    if (filtered.length === 0) {
        setReportError(t('dashboard.noReadingsForPeriod'));
        return;
    }

    const sortedFiltered = filtered.sort((a, b) => {
         const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
         const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
         return dateB.getTime() - dateA.getTime();
    });

    closeReportModal();
    setTimeout(() => {
        openBulkShareModal(sortedFiltered);
    }, 200);
  };

  // ... (form handling and helpers)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setNewFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleRemoveNewFile = (indexToRemove: number) => {
    setNewFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleRemoveExistingAttachment = (pathToRemove: string) => {
    setFormData(prev => ({
        ...prev,
        attachments: prev.attachments.filter(att => att.path !== pathToRemove),
    }));
    setAttachmentsToDelete(prev => [...prev, pathToRemove]);
  };

  const analyzeImageWithGemini = async (base64Image: string, mimeType: string) => {
    setIsAnalyzing(true);
    setAiError(null);
    try {
      const imagePart = {
        inlineData: { data: base64Image, mimeType: mimeType },
      };
      const textPart = {
        text: "Analyze the image of a blood pressure monitor. Extract the systolic (SYS), diastolic (DIA), and pulse (PUL) values. Return the result as a JSON object with numeric keys: 'systolic', 'diastolic', and 'pulse'. If a value is not visible or cannot be determined, return null for that key."
      };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              systolic: { type: Type.NUMBER, description: "Systolic blood pressure value" },
              diastolic: { type: Type.NUMBER, description: "Diastolic blood pressure value" },
              pulse: { type: Type.NUMBER, description: "Pulse rate value" },
            },
            required: ["systolic", "diastolic", "pulse"],
          },
        },
      });

      const jsonString = response.text.trim();
      const data = JSON.parse(jsonString);

      setFormData(prev => ({
        ...prev,
        systolic: data.systolic?.toString() ?? '',
        diastolic: data.diastolic?.toString() ?? '',
        pulse: data.pulse?.toString() ?? '',
      }));

    } catch (error) {
      console.error("Error analyzing image with Gemini:", error);
      setAiError(t('modal.aiError'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      if (base64String) {
        analyzeImageWithGemini(base64String, file.type);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClearImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setAiError(null);
    setIsAnalyzing(false);
    setFormData(prev => ({ ...prev, systolic: '', diastolic: '', pulse: '' }));
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
  
    isSubmittingRef.current = true;
    setIsSubmitting(true);
  
    try {
      if (editingId) {
        if (modalContent === 'blood-pressure') {
          const { error } = await supabase
            .from('blood_pressure_readings')
            .update({
              systolic: formData.systolic,
              diastolic: formData.diastolic,
              pulse: formData.pulse,
              date: formData.date,
              time: formData.time,
            })
            .match({ id: editingId, user_id: session.user.id });
  
          if (error) {
            console.error("Error updating reading:", error);
          } else {
            setBloodPressureReadings(prev => prev.map(r => 
              r.id === editingId 
                ? { ...r, ...formData } 
                : r
            ));
          }
        } else if (modalContent === 'appointment') {
          if (attachmentsToDelete.length > 0) {
            const { error: deleteError } = await supabase.storage.from('appointment-attachments').remove(attachmentsToDelete);
            if (deleteError) console.error("Error deleting attachments:", deleteError);
          }
  
          const uploadedAttachments = [...formData.attachments];
          if (newFiles.length > 0) {
            for (const file of newFiles) {
              const filePath = `${session.user.id}/${editingId}/${Date.now()}-${file.name}`;
              const { error: uploadError } = await supabase.storage.from('appointment-attachments').upload(filePath, file);
              if (uploadError) console.error("Error uploading file:", uploadError);
              else uploadedAttachments.push({ name: file.name, path: filePath });
            }
          }

          const notesPayload = JSON.stringify({
            purpose: formData.purpose,
            pre_notes: formData.pre_notes,
            post_notes: formData.post_notes,
            attachments: uploadedAttachments,
          });
          const { error } = await supabase
            .from('appointments')
            .update({
              hospital: formData.hospital,
              date: formData.date,
              time: formData.time,
              doctor: formData.doctor,
              notes: notesPayload,
            })
            .match({ id: editingId, user_id: session.user.id });
  
          if (error) {
            console.error("Error updating appointment:", error.message);
          } else {
            setAppointments(prev => prev.map(a => 
              a.id === editingId 
                ? {
                    ...a,
                    hospital: formData.hospital,
                    date: formData.date,
                    time: formData.time,
                    doctor: formData.doctor,
                    purpose: formData.purpose,
                    pre_notes: formData.pre_notes,
                    post_notes: formData.post_notes,
                    attachments: uploadedAttachments,
                  } 
                : a
            ));
          }
        }
      } else {
        if (modalContent === 'blood-pressure') {
          const { data, error } = await supabase
            .from('blood_pressure_readings')
            .insert([{
              user_id: session.user.id,
              systolic: formData.systolic, diastolic: formData.diastolic, pulse: formData.pulse,
              date: formData.date, time: formData.time,
            }])
            .select();
  
          if (error) {
            console.error("Error adding reading:", error);
          } else if (data && data.length > 0) {
            setBloodPressureReadings(prev => [data[0] as BloodPressureEntry, ...prev]);
            setBpCurrentPage(1);
          }
        } else if (modalContent === 'appointment') {
            const tempNotesPayload = JSON.stringify({
                purpose: formData.purpose, pre_notes: formData.pre_notes, post_notes: formData.post_notes, attachments: [],
            });
            const { data, error } = await supabase.from('appointments').insert([{
                user_id: session.user.id, hospital: formData.hospital, date: formData.date,
                time: formData.time, doctor: formData.doctor, notes: tempNotesPayload,
            }]).select().single();
            
            if (error || !data) {
                console.error("Error adding appointment:", error?.message);
            } else {
                const newAppointmentId = data.id;
                const uploadedAttachments: { name: string; path: string }[] = [];
                if (newFiles.length > 0) {
                    for (const file of newFiles) {
                        const filePath = `${session.user.id}/${newAppointmentId}/${Date.now()}-${file.name}`;
                        const { error: uploadError } = await supabase.storage.from('appointment-attachments').upload(filePath, file);
                        if (uploadError) console.error("Error uploading file:", uploadError);
                        else uploadedAttachments.push({ name: file.name, path: filePath });
                    }
                }

                if (uploadedAttachments.length > 0) {
                    const finalNotesPayload = JSON.stringify({
                        purpose: formData.purpose, pre_notes: formData.pre_notes, post_notes: formData.post_notes, attachments: uploadedAttachments
                    });
                    const { error: updateError } = await supabase.from('appointments').update({ notes: finalNotesPayload }).match({ id: newAppointmentId });
                    if (updateError) console.error("Error updating appointment with attachments:", updateError);
                }

                const newAppointment: AppointmentEntry = {
                  id: data.id,
                  hospital: data.hospital,
                  date: data.date,
                  time: data.time,
                  doctor: data.doctor,
                  purpose: formData.purpose,
                  pre_notes: formData.pre_notes,
                  post_notes: formData.post_notes,
                  attachments: uploadedAttachments,
                  created_at: data.created_at,
                };
                setAppointments(prev => [newAppointment, ...prev]);
                setApptCurrentPage(1);
            }
        }
      }
      closeModal();
    } catch (err) {
      console.error("An unexpected error occurred during form submission:", err);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName.toLowerCase() !== 'textarea') {
      e.preventDefault();
    }
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(calendarDisplayDate.getFullYear(), calendarDisplayDate.getMonth(), day);
    
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const date = String(selectedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${date}`;

    setFormData(prev => ({...prev, date: dateString}));
    setIsCalendarOpen(false);
  };

  const handleYearSelect = (year: number) => {
    setCalendarDisplayDate(new Date(year, calendarDisplayDate.getMonth(), 1));
    setCalendarView('days');
  };

  const handleHourSelect = (hour: number) => {
    const currentMinutes = formData.time.split(':')[1] || '00';
    const newHour = String(hour).padStart(2, '0');
    setFormData(prev => ({ ...prev, time: `${newHour}:${currentMinutes}` }));
    setTimePickerView('minutes');
  };

  const handleMinuteSelect = (minute: number) => {
    const currentHour = formData.time.split(':')[0] || new Date().getHours().toString().padStart(2, '0');
    const newMinute = String(minute).padStart(2, '0');
    setFormData(prev => ({ ...prev, time: `${currentHour}:${newMinute}` }));
    setIsTimePickerOpen(false);
  };

  const handlePageClick = (listType: 'bp' | 'appt', currentPage: number) => {
    setEditingPageFor(listType);
    setPageInput(String(currentPage));
  };

  const handlePageInputSubmit = () => {
    if (!editingPageFor) return;

    const totalPages = editingPageFor === 'bp'
      ? Math.ceil(bloodPressureReadings.length / ITEMS_PER_PAGE)
      : Math.ceil(appointments.length / ITEMS_PER_PAGE);

    const onPageChange = editingPageFor === 'bp' ? setBpCurrentPage : setApptCurrentPage;

    let newPage = parseInt(pageInput, 10);
    if (isNaN(newPage)) {
      setEditingPageFor(null);
      return;
    }
    
    newPage = Math.max(1, Math.min(newPage, totalPages || 1));
    
    onPageChange(newPage);
    setEditingPageFor(null);
  };

  const animationClass = isExiting ? 'animate-page-exit' : 'animate-page-enter';

  const filteredBloodPressureReadings = useMemo(() => {
    if (!bpSearchDay && !bpSearchMonth && !bpSearchYear) {
      return bloodPressureReadings;
    }

    return bloodPressureReadings.filter(reading => {
      if (!reading.date || !/^\d{4}-\d{2}-\d{2}$/.test(reading.date)) {
        return false;
      }
      const readingDate = new Date(reading.date + 'T00:00:00');
      if (isNaN(readingDate.getTime())) return false;

      const day = readingDate.getDate();
      const month = readingDate.getMonth() + 1;
      const year = readingDate.getFullYear();

      const dayMatch = !bpSearchDay || day === parseInt(bpSearchDay, 10);
      const monthMatch = !bpSearchMonth || month === parseInt(bpSearchMonth, 10);
      const yearMatch = !bpSearchYear || year === parseInt(bpSearchYear, 10);

      return dayMatch && monthMatch && yearMatch;
    });
  }, [bloodPressureReadings, bpSearchDay, bpSearchMonth, bpSearchYear]);

  const sortedBloodPressureReadings = useMemo(() => {
    const sortable = [...filteredBloodPressureReadings];
    switch (bpSortOption) {
        case 'created_at_asc':
            return sortable.reverse();
        case 'date_desc':
            return sortable.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
                const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
                return dateB.getTime() - dateA.getTime();
            });
        case 'date_asc':
             return sortable.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
                const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
                return dateA.getTime() - dateB.getTime();
            });
        case 'created_at_desc':
        default:
            return sortable;
    }
  }, [filteredBloodPressureReadings, bpSortOption]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(appt => {
      const dateMatch = (() => {
        if (!apptSearchDay && !apptSearchMonth && !apptSearchYear) return true;
        if (!appt.date || !/^\d{4}-\d{2}-\d{2}$/.test(appt.date)) return false;
        
        const apptDate = new Date(appt.date + 'T00:00:00');
        if (isNaN(apptDate.getTime())) return false;

        const day = apptDate.getDate();
        const month = apptDate.getMonth() + 1;
        const year = apptDate.getFullYear();

        const dayMatch = !apptSearchDay || day === parseInt(apptSearchDay, 10);
        const monthMatch = !apptSearchMonth || month === parseInt(apptSearchMonth, 10);
        const yearMatch = !apptSearchYear || year === parseInt(apptSearchYear, 10);
        
        return dayMatch && monthMatch && yearMatch;
      })();

      const keywordMatch = (() => {
        if (!appointmentSearchQuery) return true;
        const lowercasedQuery = appointmentSearchQuery.toLowerCase();
        return (
          appt.hospital?.toLowerCase().includes(lowercasedQuery) ||
          appt.doctor?.toLowerCase().includes(lowercasedQuery) ||
          appt.purpose?.toLowerCase().includes(lowercasedQuery)
        );
      })();

      return dateMatch && keywordMatch;
    });
  }, [appointments, appointmentSearchQuery, apptSearchDay, apptSearchMonth, apptSearchYear]);
  
  const sortedAppointments = useMemo(() => {
    const sortable = [...filteredAppointments];
    switch (apptSortOption) {
        case 'created_at_asc':
            return sortable.reverse();
        case 'date_desc':
            return sortable.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
                const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
                return dateB.getTime() - dateA.getTime();
            });
        case 'date_asc':
             return sortable.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
                const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
                return dateA.getTime() - dateB.getTime();
            });
        case 'created_at_desc':
        default:
            return sortable;
    }
  }, [filteredAppointments, apptSortOption]);


  const calendarDays = useMemo(() => {
    const year = calendarDisplayDate.getFullYear();
    const month = calendarDisplayDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [calendarDisplayDate]);
  
  const calendarYearRange = useMemo(() => {
    const year = calendarDisplayDate.getFullYear();
    const startYear = year - (year % 12);
    return Array.from({ length: 12 }, (_, i) => startYear + i);
  }, [calendarDisplayDate]);

  const isFormValid = useMemo(() => {
    if (!modalContent) return false;

    if (modalContent === 'blood-pressure') {
      return !!(formData.systolic.trim() && formData.diastolic.trim() && formData.date && formData.time);
    }
    if (modalContent === 'appointment') {
      return !!(formData.hospital.trim() && formData.date && formData.time);
    }
    return false;
  }, [formData.systolic, formData.diastolic, formData.hospital, formData.date, formData.time, modalContent]);

  const gridStyle: React.CSSProperties = {
    backgroundImage: theme === 'dark' 
      ? `linear-gradient(to right, rgba(220, 38, 38, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(220, 38, 38, 0.3) 1px, transparent 1px)`
      : `linear-gradient(to right, rgba(156, 163, 175, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(156, 163, 175, 0.3) 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
    animation: 'slideGrid 1s linear infinite',
  };

  const renderPaginationControls = (listType: 'bp' | 'appt', currentPage: number, totalPages: number, onPageChange: React.Dispatch<React.SetStateAction<number>>) => {
    if (totalPages <= 1) return null;
  
    return (
      <div className="flex items-center justify-center mt-8 space-x-2 text-white">
        <button
          onClick={() => onPageChange(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="px-3 py-2 text-lg font-bold leading-none rounded-md bg-gray-800/50 hover:bg-red-500/30 border border-gray-600/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-800/50 transition-all"
        >
          &lt;
        </button>
        
        {editingPageFor === listType ? (
          <input
            type="number"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={handlePageInputSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handlePageInputSubmit();
              } else if (e.key === 'Escape') {
                setEditingPageFor(null);
              }
            }}
            className="font-semibold text-gray-300 w-12 text-center bg-gray-700/50 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            autoFocus
            onFocus={(e) => e.target.select()}
          />
        ) : (
          <span
            className="font-semibold text-gray-300 w-12 text-center cursor-pointer p-1 rounded-md hover:bg-gray-700/50 transition-colors"
            onClick={() => handlePageClick(listType, currentPage)}
          >
            {currentPage}
          </span>
        )}

        <button
          onClick={() => onPageChange(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="px-3 py-2 text-lg font-bold leading-none rounded-md bg-gray-800/50 hover:bg-red-500/30 border border-gray-600/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-800/50 transition-all"
        >
          &gt;
        </button>
      </div>
    );
  };


  const renderPageContent = () => {
    if (page === 'main_dashboard') {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full relative">
           {onViewOverview && (
             <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-20">
               <button
                 onClick={onViewOverview}
                 className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-500/50 backdrop-blur-sm text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all shadow-md hover:shadow-lg ring-1 ring-black/5 dark:ring-0"
                 aria-label="View Project Information & Portfolio"
               >
                 <span className="text-red-600 dark:text-red-500 w-4 h-4 flex items-center justify-center">
                   <HeartbeatIcon />
                 </span>
                 <span className="hidden sm:inline font-semibold">{language === 'th' ? 'ข้อมูลโครงงาน' : 'Portfolio Info'}</span>
               </button>
             </div>
           )}
           <div className="absolute top-4 right-4 sm:top-8 sm:right-8 flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={toggleTheme}
              className="bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-500/50 rounded-full p-3 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-all duration-300 ease-in-out shadow-md hover:shadow-lg dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] ring-1 ring-black/5 dark:ring-0 hover:ring-2 hover:ring-gray-500/50 dark:hover:ring-white/50"
              aria-label={t('dashboard.toggleTheme')}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              onClick={onLogout}
              className="bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-500/50 rounded-full p-3 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-all duration-300 ease-in-out shadow-md hover:shadow-lg dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] ring-1 ring-black/5 dark:ring-0 hover:ring-2 hover:ring-gray-500/50 dark:hover:ring-white/50"
              aria-label={t('dashboard.logout')}
            >
              <LogoutIcon />
            </button>
           </div>
          <div className="text-center mb-12">
            <h1
              className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-red-500 via-gray-900 to-red-600 dark:from-red-400 dark:via-white dark:to-red-500 bg-clip-text text-transparent animate-[shine_3s_linear_infinite] dark:[text-shadow:0_0_12px_rgba(239,68,68,0.7)]"
              style={{ backgroundSize: '200% auto' }}
            >
              {t('dashboard.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg truncate max-w-sm">
              {t('dashboard.welcome', { email: session.user.email })}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 w-full px-4 relative">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-red-600/10 blur-[100px] rounded-full pointer-events-none"></div>
            <DashboardButton
              title={t('dashboard.bpButton')}
              icon={<BloodPressureIcon />}
              onClick={() => navigateTo('blood-pressure')}
            />
            <DashboardButton
              title={t('dashboard.appointmentsButton')}
              icon={<AppointmentsIcon />}
              onClick={() => navigateTo('appointments')}
            />
          </div>
        </div>
      );
    }
    
    // ... (rest of the render logic remains identical)
    const renderEmptyState = (type: 'blood-pressure' | 'appointments') => (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 opacity-50">
            {type === 'blood-pressure' ? (
                <>
                    <div className="w-20 h-20 sm:w-24 sm:h-24 text-red-400 dark:text-red-500/50"><BloodPressureIcon className="w-full h-full" /></div>
                    <p className="mt-4 text-lg sm:text-xl">{t('dashboard.emptyState.bp')}</p>
                    <p className="text-gray-600 dark:text-gray-500">{t('dashboard.emptyState.hint')}</p>
                </>
            ) : (
                <>
                    <div className="w-20 h-20 sm:w-24 sm:h-24 text-red-400 dark:text-red-500/50"><AppointmentsIcon className="w-full h-full" /></div>
                    <p className="mt-4 text-lg sm:text-xl">{t('dashboard.emptyState.appt')}</p>
                    <p className="text-gray-600 dark:text-gray-500">{t('dashboard.emptyState.hint')}</p>
                </>
            )}
        </div>
    );
    
    if (isLoadingData) {
        return <div className="flex items-center justify-center h-full text-white">{t('dashboard.loadingData')}</div>;
    }

    const selectBaseClasses = "bg-transparent text-center focus:outline-none cursor-pointer";
    const optionClasses = "bg-gray-900 text-white";

    const SortDropdown: React.FC<{ sortOption: SortOption, setSortOption: (value: SortOption) => void }> = ({ sortOption, setSortOption }) => (
      <div className="inline-flex items-center gap-2 bg-gray-900/50 dark:bg-gray-800/40 border border-red-900/30 rounded-lg p-2 backdrop-blur-sm">
        <label htmlFor="sort-control" className="text-sm text-gray-400 pl-2">{t('dashboard.sortBy')}</label>
        <select
          id="sort-control"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          className="bg-transparent text-white focus:outline-none cursor-pointer pr-2"
          style={{ colorScheme: 'dark' }}
        >
          <option value="created_at_desc" className={optionClasses}>{t('dashboard.sort.recent')}</option>
          <option value="created_at_asc" className={optionClasses}>{t('dashboard.sort.oldest')}</option>
          <option value="date_desc" className={optionClasses}>{t('dashboard.sort.dateDesc')}</option>
          <option value="date_asc" className={optionClasses}>{t('dashboard.sort.dateAsc')}</option>
        </select>
      </div>
    );

    return (
      <div className="w-full h-full relative">
        <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-20 flex items-center gap-3 transition-all">
          <button
            onClick={() => navigateTo('main_dashboard')}
            className="bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-500/50 rounded-full p-3 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-all duration-300 ease-in-out shadow-md hover:shadow-lg dark:shadow-[0_0_15px_rgba(255,255,255,0.3)] dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] ring-1 ring-black/5 dark:ring-0 hover:ring-gray-500/50 dark:hover:ring-white/50"
            aria-label={t('dashboard.goBack')}
          >
            <BackArrowIcon />
          </button>
          
          {page === 'blood-pressure' && (
             <button
                onClick={handleCreateReport}
                className="bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-500/50 rounded-full px-4 py-3 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-all duration-300 ease-in-out shadow-md hover:shadow-lg dark:shadow-[0_0_15px_rgba(255,255,255,0.3)] dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] ring-1 ring-black/5 dark:ring-0 hover:ring-gray-500/50 dark:hover:ring-white/50 flex items-center gap-2 animate-card-enter"
             >
                <ReportIcon />
                <span className="font-semibold hidden sm:inline">{t('dashboard.createReport')}</span>
             </button>
          )}
        </div>

        <div className="absolute top-4 right-4 sm:top-8 sm:right-8 flex items-center gap-2 z-20">
            {isSelectionModeActive ? (
                <>
                    <button
                        onClick={handleBulkShare}
                        disabled={selectedIds.length === 0}
                        className="flex items-center gap-2 bg-green-900/50 border border-green-500/50 rounded-full py-3 px-4 backdrop-blur-sm text-green-300 hover:text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-green-300"
                        aria-label={t('dashboard.shareSelected', { count: selectedIds.length })}
                    >
                        <ShareIcon />
                        <span>{t('dashboard.shareSelected', { count: selectedIds.length })}</span>
                    </button>
                    <button
                        onClick={handleBulkDelete}
                        disabled={selectedIds.length === 0}
                        className="flex items-center gap-2 bg-red-900/50 border border-red-500/50 rounded-full py-3 px-4 backdrop-blur-sm text-red-300 hover:text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-red-300"
                        aria-label={t('dashboard.deleteSelected', { count: selectedIds.length })}
                    >
                        <TrashIcon />
                        <span>{t('dashboard.deleteSelected', { count: selectedIds.length })}</span>
                    </button>
                    <button
                        onClick={toggleSelectionMode}
                        className="bg-gray-900/50 border border-gray-500/50 rounded-full py-3 px-5 backdrop-blur-sm text-gray-300 hover:text-white font-semibold transition-all"
                        aria-label={t('common.cancel')}
                    >
                        {t('common.cancel')}
                    </button>
                </>
            ) : (
                <>
                     <button
                        onClick={toggleSelectionMode}
                        className="bg-gray-900/50 border border-gray-500/50 rounded-full py-3 px-5 backdrop-blur-sm text-gray-300 hover:text-white font-semibold transition-all"
                        aria-label={t('dashboard.select')}
                    >
                        {t('dashboard.select')}
                    </button>
                    <button
                        onClick={() => openModal(page === 'blood-pressure' ? 'blood-pressure' : 'appointment', false)}
                        className="bg-green-100/80 dark:bg-green-900/50 border border-green-300/80 dark:border-green-500/50 rounded-full p-3 backdrop-blur-sm text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-white transition-all duration-300 ease-in-out shadow-md hover:shadow-lg dark:shadow-[0_0_15px_rgba(74,222,128,0.3)] dark:hover:shadow-[0_0_25px_rgba(74,222,128,0.5)] ring-1 ring-black/5 dark:ring-0 hover:ring-green-500/50 dark:hover:ring-green-500/50"
                        aria-label={t('dashboard.addNew')}
                    >
                        <PlusIcon />
                    </button>
                </>
            )}
        </div>


        {page === 'blood-pressure' && (
          <>
            <div className="w-full max-w-xl mx-auto pt-24 sm:pt-28 pb-8 h-full overflow-y-auto no-scrollbar flex flex-col">
              <div className="mb-6 flex flex-col items-center gap-4">
                <div className="inline-flex items-center gap-2 bg-gray-900/50 dark:bg-gray-800/40 border border-red-900/30 rounded-lg p-2 backdrop-blur-sm">
                  <div className="relative">
                    <select
                      value={bpSearchDay}
                      onChange={(e) => setBpSearchDay(e.target.value)}
                      className={`${selectBaseClasses} w-24 pr-8 ${bpSearchDay ? 'text-white' : 'text-gray-400'}`}
                      aria-label={t('common.search') + ' by ' + t('common.day')}
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="" className={optionClasses}>{t('common.day')}</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day} className={optionClasses}>{String(day).padStart(2, '0')}</option>
                      ))}
                    </select>
                    {bpSearchDay && (
                      <button onClick={() => setBpSearchDay('')} className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white" aria-label="Clear day search">
                        <CloseIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <select
                      value={bpSearchMonth}
                      onChange={(e) => setBpSearchMonth(e.target.value)}
                      className={`${selectBaseClasses} w-36 pr-8 ${bpSearchMonth ? 'text-white' : 'text-gray-400'}`}
                      aria-label={t('common.search') + ' by ' + t('common.month')}
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="" className={optionClasses}>{t('common.month')}</option>
                      {monthNames.map((name, index) => (
                        <option key={name} value={index + 1} className={optionClasses}>{name}</option>
                      ))}
                    </select>
                    {bpSearchMonth && (
                      <button onClick={() => setBpSearchMonth('')} className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white" aria-label="Clear month search">
                        <CloseIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <select
                      value={bpSearchYear}
                      onChange={(e) => setBpSearchYear(e.target.value)}
                      className={`${selectBaseClasses} w-28 pr-8 ${bpSearchYear ? 'text-white' : 'text-gray-400'}`}
                      aria-label={t('common.search') + ' by ' + t('common.year')}
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="" className={optionClasses}>{t('common.year')}</option>
                      {years.map(year => (
                        <option key={year} value={year} className={optionClasses}>{year}</option>
                      ))}
                    </select>
                    {bpSearchYear && (
                      <button onClick={() => setBpSearchYear('')} className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white" aria-label="Clear year search">
                        <CloseIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <SearchIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </div>
                <SortDropdown sortOption={bpSortOption} setSortOption={setBpSortOption} />
              </div>

              <div className="my-auto">
                {bloodPressureReadings.length > 0 ? (
                    sortedBloodPressureReadings.length > 0 ? (
                        <>
                            <div className="space-y-4">
                            {(() => {
                                const bpTotalPages = Math.ceil(sortedBloodPressureReadings.length / ITEMS_PER_PAGE);
                                const bpIndexOfLastItem = bpCurrentPage * ITEMS_PER_PAGE;
                                const bpIndexOfFirstItem = bpIndexOfLastItem - ITEMS_PER_PAGE;
                                const currentBpReadings = sortedBloodPressureReadings.slice(bpIndexOfFirstItem, bpIndexOfLastItem);
                                
                                return (
                                <>
                                    {currentBpReadings.map((reading, index) => (
                                    <CompactReadingCard
                                        key={reading.id}
                                        reading={reading}
                                        index={index}
                                        onSelect={() => openDetailModal(reading)}
                                        onEdit={() => handleStartEdit(reading)}
                                        onDelete={() => handleDeleteReading(reading.id)}
                                        onShare={() => openShareModal(reading)}
                                        isDeleting={deletingReadingId === reading.id}
                                        isSelectionModeActive={isSelectionModeActive}
                                        isSelected={selectedIds.includes(reading.id)}
                                        onToggleSelect={handleToggleSelectId}
                                    />
                                    ))}
                                    {renderPaginationControls('bp', bpCurrentPage, bpTotalPages, setBpCurrentPage)}
                                </>
                                );
                            })()}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 opacity-75">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 text-red-400 dark:text-red-500/50">
                                <SearchIcon className="w-full h-full" />
                            </div>
                            <p className="mt-4 text-lg sm:text-xl">{t('dashboard.noResults')}</p>
                            <p className="text-gray-600 dark:text-gray-500">{t('dashboard.noResultsHint')}</p>
                        </div>
                    )
                ) : (
                  renderEmptyState('blood-pressure')
                )}
              </div>
            </div>
          </>
        )}

        {page === 'appointments' && (
          <>
            <div className="w-full max-w-xl mx-auto pt-24 sm:pt-28 pb-8 h-full overflow-y-auto no-scrollbar flex flex-col">
              <div className="flex flex-col items-center gap-4 mb-6">
                {/* Search controls for appointments - similar to BP but with text search */}
                <div className="inline-flex items-center gap-2 bg-gray-900/50 dark:bg-gray-800/40 border border-red-900/30 rounded-lg p-2 backdrop-blur-sm">
                    {/* ... Date dropdowns ... */}
                    <div className="relative">
                        <select
                        value={apptSearchDay}
                        onChange={(e) => setApptSearchDay(e.target.value)}
                        className={`${selectBaseClasses} w-24 pr-8 ${apptSearchDay ? 'text-white' : 'text-gray-400'}`}
                        aria-label={t('common.search') + ' by ' + t('common.day')}
                        style={{ colorScheme: 'dark' }}
                        >
                        <option value="" className={optionClasses}>{t('common.day')}</option>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                            <option key={day} value={day} className={optionClasses}>{String(day).padStart(2, '0')}</option>
                        ))}
                        </select>
                        {apptSearchDay && (
                        <button onClick={() => setApptSearchDay('')} className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white" aria-label="Clear day search">
                            <CloseIcon className="h-4 w-4" />
                        </button>
                        )}
                    </div>
                    {/* ... Month and Year dropdowns ... */}
                    <div className="relative">
                        <select
                        value={apptSearchMonth}
                        onChange={(e) => setApptSearchMonth(e.target.value)}
                        className={`${selectBaseClasses} w-36 pr-8 ${apptSearchMonth ? 'text-white' : 'text-gray-400'}`}
                        aria-label={t('common.search') + ' by ' + t('common.month')}
                        style={{ colorScheme: 'dark' }}
                        >
                        <option value="" className={optionClasses}>{t('common.month')}</option>
                        {monthNames.map((name, index) => (
                            <option key={name} value={index + 1} className={optionClasses}>{name}</option>
                        ))}
                        </select>
                        {apptSearchMonth && (
                        <button onClick={() => setApptSearchMonth('')} className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white" aria-label="Clear month search">
                            <CloseIcon className="h-4 w-4" />
                        </button>
                        )}
                    </div>
                    <div className="relative">
                        <select
                        value={apptSearchYear}
                        onChange={(e) => setApptSearchYear(e.target.value)}
                        className={`${selectBaseClasses} w-28 pr-8 ${apptSearchYear ? 'text-white' : 'text-gray-400'}`}
                        aria-label={t('common.search') + ' by ' + t('common.year')}
                        style={{ colorScheme: 'dark' }}
                        >
                        <option value="" className={optionClasses}>{t('common.year')}</option>
                        {years.map(year => (
                            <option key={year} value={year} className={optionClasses}>{year}</option>
                        ))}
                        </select>
                        {apptSearchYear && (
                        <button onClick={() => setApptSearchYear('')} className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white" aria-label="Clear year search">
                            <CloseIcon className="h-4 w-4" />
                        </button>
                        )}
                    </div>
                    <SearchIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </div>
                <div className="relative w-full max-w-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={appointmentSearchQuery}
                        onChange={(e) => setAppointmentSearchQuery(e.target.value)}
                        placeholder={t('dashboard.searchPlaceholder')}
                        className="w-full bg-gray-900/50 dark:bg-gray-800/40 border border-red-900/30 rounded-lg p-2 pl-10 pr-10 backdrop-blur-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        style={{ colorScheme: 'dark' }}
                    />
                    {appointmentSearchQuery && (
                        <button
                            onClick={() => setAppointmentSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            aria-label="Clear search"
                        >
                            <CloseIcon className="h-4 w-4 text-gray-500 hover:text-white" />
                        </button>
                    )}
                </div>
                <SortDropdown sortOption={apptSortOption} setSortOption={setApptSortOption} />
              </div>

              <div className="my-auto">
                {appointments.length > 0 ? (
                  sortedAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {(() => {
                        const apptTotalPages = Math.ceil(sortedAppointments.length / ITEMS_PER_PAGE);
                        const apptIndexOfLastItem = apptCurrentPage * ITEMS_PER_PAGE;
                        const apptIndexOfFirstItem = apptIndexOfLastItem - ITEMS_PER_PAGE;
                        const currentAppointments = sortedAppointments.slice(apptIndexOfFirstItem, apptIndexOfLastItem);

                        return (
                          <>
                            {currentAppointments.map((reading, index) => (
                              <CompactReadingCard
                                key={reading.id}
                                reading={reading}
                                index={index}
                                onSelect={() => openDetailModal(reading)}
                                onEdit={() => handleStartEdit(reading)}
                                onDelete={() => handleDeleteReading(reading.id)}
                                onShare={() => openShareModal(reading)}
                                isDeleting={deletingReadingId === reading.id}
                                isSelectionModeActive={isSelectionModeActive}
                                isSelected={selectedIds.includes(reading.id)}
                                onToggleSelect={handleToggleSelectId}
                              />
                            ))}
                            {renderPaginationControls('appt', apptCurrentPage, apptTotalPages, setApptCurrentPage)}
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 opacity-75">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 text-red-400 dark:text-red-500/50">
                            <SearchIcon className="w-full h-full" />
                        </div>
                        <p className="mt-4 text-lg sm:text-xl">{t('dashboard.noResults')}</p>
                        <p className="text-gray-600 dark:text-gray-500">{t('dashboard.noResultsHint')}</p>
                    </div>
                  )
                ) : (
                  renderEmptyState('appointments')
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };
  // ... (rest of component remains the same)
  const contentWrapperLayout = page === 'main_dashboard' 
    ? 'justify-center' 
    : 'justify-start';

  return (
    <>
      <style>{`
        html, body {
          overflow: hidden;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        html::-webkit-scrollbar,
        body::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes aurora {
          from { background-position: 50% 0%; }
          to { background-position: 50% 100%; }
        }
        @keyframes slideGrid { from { background-position: 0 0; } to { background-position: -40px -40px; } }
        @keyframes shine { to { background-position: 200% center; } }
        
        @keyframes page-enter { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes page-exit { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(-10px) scale(0.98); } }
        .animate-page-enter { animation: page-enter 0.2s ease-out forwards; }
        .animate-page-exit { animation: page-exit 0.2s ease-in forwards; }

        @keyframes modal-overlay-enter { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modal-overlay-exit { from { opacity: 1; } to { opacity: 0; } }
        @keyframes modal-enter { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes modal-exit { from { opacity: 1; transform: scale(1) translateY(0); } to { opacity: 0; transform: scale(0.95) translateY(10px); } }
        .animate-modal-overlay-enter { animation: modal-overlay-enter 0.2s ease-out forwards; }
        .animate-modal-overlay-exit { animation: modal-overlay-exit 0.2s ease-in forwards; }
        .animate-modal-enter { animation: modal-enter 0.2s ease-out forwards; }
        .animate-modal-exit { animation: modal-exit 0.2s ease-in forwards; }
        
        @keyframes card-enter { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-card-enter { animation: card-enter 0.5s ease-out forwards; }
        
        @keyframes card-exit { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); } }
        .animate-card-exit { animation: card-exit 0.5s ease-out forwards; }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <main
        className="h-screen w-full flex flex-col items-center p-4 font-sans select-none overflow-hidden bg-gray-200 dark:bg-black relative transition-colors duration-500"
      >
        <div
            className="absolute inset-0 z-0"
            style={{
                background: theme === 'dark' 
                    ? `radial-gradient(ellipse at 25% 25%, rgba(220, 38, 38, 0.2) 0%, transparent 50%),
                       radial-gradient(ellipse at 75% 75%, rgba(220, 38, 38, 0.2) 0%, transparent 50%)`
                    : `radial-gradient(ellipse at 25% 25%, rgba(220, 38, 38, 0.1) 0%, transparent 50%),
                       radial-gradient(ellipse at 75% 75%, rgba(156, 163, 175, 0.2) 0%, transparent 50%)`,
                backgroundSize: '200% 200%',
                animation: 'aurora 10s alternate infinite',
                opacity: theme === 'dark' ? 0.5 : 1,
                transition: 'background 0.5s, opacity 0.5s',
            }}
        />
        <div
          className="absolute inset-0 z-1 blur-lg transition-all duration-500"
          style={gridStyle}
        />
        <div
            className="absolute inset-0 z-1"
            style={{
                ...gridStyle,
                maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
            }}
        />

        <div className={`relative z-10 flex flex-col items-center w-full h-full ${contentWrapperLayout} ${animationClass}`}>
          {renderPageContent()}
        </div>
        {/* ... (Modals remain unchanged) ... */}
        {modalContent && (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-[2px] p-4 ${isModalExiting ? 'animate-modal-overlay-exit' : 'animate-modal-overlay-enter'}`}
            aria-modal="true"
            role="dialog"
          >
            <div
              className={`bg-gray-900/95 dark:bg-gray-800/95 border border-red-500/10 rounded-lg shadow-2xl p-6 relative w-full max-w-md text-gray-200 mx-4 sm:mx-0 overflow-y-auto max-h-[90vh] no-scrollbar ${isModalExiting ? 'animate-modal-exit' : 'animate-modal-enter'}`}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                aria-label={t('common.close')}
              >
                <CloseIcon />
              </button>
              <h2 className="text-2xl font-bold mb-6 text-white">
                {modalContent === 'blood-pressure' 
                    ? (editingId ? t('modal.editBpTitle') : t('modal.addBpTitle'))
                    : (editingId ? t('modal.editApptTitle') : t('modal.addApptTitle'))
                }
              </h2>
              
              <form onSubmit={handleFormSubmit} onKeyDown={handleFormKeyDown}>
                {/* Form fields logic is the same */}
                <div className="space-y-4">
                  {modalContent === 'blood-pressure' && (
                    <>
                      <div className="mt-4">
                        {imagePreview ? (
                            <div className="relative group">
                                <img src={imagePreview} alt="Blood pressure reading preview" className="rounded-lg w-full max-h-48 object-contain" />
                                {isAnalyzing && (
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-lg">
                                        <div className="w-8 h-8 border-4 border-t-red-500 border-gray-600 rounded-full animate-spin"></div>
                                        <p className="text-white mt-2 text-sm">{t('modal.analyzing')}</p>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={handleClearImage}
                                    className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Remove image"
                                >
                                    <CloseIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleImageFileChange}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex flex-col items-center justify-center gap-2 py-6 px-4 bg-red-600/30 rounded-lg text-white group transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-red-700/50 hover:shadow-lg hover:shadow-red-500/50"
                                >
                                    <CameraIcon />
                                    <span className="font-semibold text-lg">{t('modal.extract')}</span>
                                    <span className="text-xs text-center text-red-100">{t('modal.extractHint')}</span>
                                </button>
                            </>
                        )}
                        {aiError && <p className="text-sm text-red-400 text-center mt-2">{aiError}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="systolic" className="block text-sm font-medium text-gray-400">{t('modal.systolicLabel')}</label>
                          <input type="number" name="systolic" id="systolic" value={formData.systolic} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-gray-800/50 dark:bg-gray-700/50 border border-gray-600/50 rounded-md shadow-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-shadow text-lg placeholder:text-lg" placeholder="120" 
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                diastolicInputRef.current?.focus();
                              }
                            }}
                          />
                        </div>
                        <div>
                          <label htmlFor="diastolic" className="block text-sm font-medium text-gray-400">{t('modal.diastolicLabel')}</label>
                          <input type="number" name="diastolic" id="diastolic" value={formData.diastolic} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-gray-800/50 dark:bg-gray-700/50 border border-gray-600/50 rounded-md shadow-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-shadow text-lg placeholder:text-lg" placeholder="80" 
                            ref={diastolicInputRef}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                pulseInputRef.current?.focus();
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="pulse" className="block text-sm font-medium text-gray-400">{t('modal.pulseLabel')}</label>
                        <input type="number" name="pulse" id="pulse" value={formData.pulse} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-gray-800/50 dark:bg-gray-700/50 border border-gray-600/50 rounded-md shadow-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-shadow text-lg placeholder:text-lg" placeholder="72"
                          ref={pulseInputRef}
                        />
                      </div>
                    </>
                  )}

                  {modalContent === 'appointment' && (
                    <>
                      <div>
                        <label htmlFor="hospital" className="block text-sm font-medium text-gray-400">{t('common.hospital')}</label>
                        <input type="text" name="hospital" id="hospital" value={formData.hospital} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 bg-gray-800/50 dark:bg-gray-700/50 border border-gray-600/50 rounded-md shadow-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-shadow text-lg placeholder:text-lg" placeholder="Siriraj Piyamaharajkarun" />
                      </div>
                      <div>
                        <label htmlFor="doctor" className="block text-sm font-medium text-gray-400">{t('common.doctor')}</label>
                        <input type="text" name="doctor" id="doctor" value={formData.doctor} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-gray-800/50 dark:bg-gray-700/50 border border-gray-600/50 rounded-md shadow-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-shadow text-lg placeholder:text-lg" placeholder="Dr. John" />
                      </div>
                    </>
                  )}

                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-400">{t('common.date')}</label>
                    <div id="date" onClick={() => { setIsCalendarOpen(true); setCalendarView('days'); }} className="mt-1 block w-full cursor-pointer px-3 py-2 bg-gray-800/50 dark:bg-gray-700/50 border border-gray-600/50 rounded-md shadow-sm text-lg">
                      {formData.date ? <span className="text-white">{new Date(formData.date + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'})}</span> : <span className="text-gray-500">{t('modal.selectDate')}</span>}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-400">{t('common.time')}</label>
                    <div className="mt-1 flex items-center w-full px-3 py-2 bg-gray-800/50 dark:bg-gray-700/50 border border-gray-600/50 rounded-md shadow-sm">
                      <span
                        onClick={() => { setIsTimePickerOpen(true); setTimePickerView('hours'); }}
                        className="text-white font-mono tracking-wider text-lg p-1 rounded cursor-pointer hover:bg-gray-600/50 transition-colors"
                        aria-label={t('modal.selectHour')}
                      >
                        {formData.time ? formData.time.split(':')[0] : 'HH'}
                      </span>
                      <span className="text-gray-500 font-mono text-lg p-1">:</span>
                      <span
                        onClick={() => { setIsTimePickerOpen(true); setTimePickerView('minutes'); }}
                        className="text-white font-mono tracking-wider text-lg p-1 rounded cursor-pointer hover:bg-gray-600/50 transition-colors"
                        aria-label={t('modal.selectMinute')}
                      >
                        {formData.time ? formData.time.split(':')[1] : 'MM'}
                      </span>
                    </div>
                  </div>
                  
                  {modalContent === 'appointment' && (
                    <>
                      <div>
                        <label htmlFor="purpose" className="block text-sm font-medium text-gray-400">{t('common.purpose')}</label>
                        <input type="text" name="purpose" id="purpose" value={formData.purpose} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-gray-800/50 dark:bg-gray-700/50 border border-gray-600/50 rounded-md shadow-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-shadow text-lg placeholder:text-lg" placeholder="Check-up" />
                      </div>
                      <div>
                        <label htmlFor="pre_notes" className="block text-sm font-medium text-gray-400">{t('common.preNotes')}</label>
                        <textarea name="pre_notes" id="pre_notes" value={formData.pre_notes} onChange={handleInputChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-gray-800/50 dark:bg-gray-700/50 border border-gray-600/50 rounded-md shadow-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-shadow text-lg placeholder:text-lg" placeholder="..."></textarea>
                      </div>
                      <div>
                        <label htmlFor="post_notes" className="block text-sm font-medium text-gray-400">{t('common.postNotes')}</label>
                        <textarea name="post_notes" id="post_notes" value={formData.post_notes} onChange={handleInputChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-gray-800/50 dark:bg-gray-700/50 border border-gray-600/50 rounded-md shadow-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-shadow text-lg placeholder:text-lg" placeholder="..."></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400">{t('common.attachments')}</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600/50 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <AttachmentIcon />
                                <div className="flex text-sm text-gray-500">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-700/50 rounded-md font-medium text-red-400 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-red-500 px-3 py-1">
                                        <span>{t('modal.uploadFile')}</span>
                                        <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} />
                                    </label>
                                    <p className="pl-1 self-center">{t('modal.dragDrop')}</p>
                                </div>
                                <p className="text-xs text-gray-500">{t('modal.fileTypes')}</p>
                            </div>
                        </div>
                      </div>

                      {(formData.attachments.length > 0 || newFiles.length > 0) && (
                        <div className="mt-2 space-y-2 max-h-32 overflow-y-auto no-scrollbar pr-2">
                          {formData.attachments.map((file) => (
                            <div key={file.path} className="flex items-center justify-between p-2 bg-gray-700/50 rounded-md animate-card-enter opacity-0" style={{ animationFillMode: 'forwards' }}>
                              <span className="text-sm text-gray-300 truncate pr-2">{file.name}</span>
                              <button type="button" onClick={() => handleRemoveExistingAttachment(file.path)} className="text-gray-400 hover:text-red-400 flex-shrink-0">
                                <TrashIcon />
                              </button>
                            </div>
                          ))}
                          {newFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-700/50 rounded-md animate-card-enter opacity-0" style={{ animationFillMode: 'forwards' }}>
                              <span className="text-sm text-gray-300 truncate pr-2">{file.name}</span>
                              <button type="button" onClick={() => handleRemoveNewFile(index)} className="text-gray-400 hover:text-red-400 flex-shrink-0">
                                <TrashIcon />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="mt-6">
                  <button type="submit" disabled={isSubmitting || !isFormValid} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting 
                        ? (editingId ? t('common.submitting') : t('common.submitting')) 
                        : (editingId 
                            ? t('common.save') 
                            : (modalContent === 'blood-pressure' ? t('modal.addReading') : t('modal.addAppointment')))
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* ... (Report modal, calendar, etc remain same) ... */}
        {isReportModalOpen && (
            <div
                className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-[2px] p-4 ${isReportModalExiting ? 'animate-modal-overlay-exit' : 'animate-modal-overlay-enter'}`}
                aria-modal="true"
                role="dialog"
            >
                <div
                    className={`bg-gray-900/95 dark:bg-gray-800/95 border border-red-500/10 rounded-lg shadow-2xl p-6 relative w-full max-w-sm text-gray-200 mx-4 sm:mx-0 ${isReportModalExiting ? 'animate-modal-exit' : 'animate-modal-enter'}`}
                >
                    <button
                        onClick={closeReportModal}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        aria-label={t('common.close')}
                    >
                        <CloseIcon />
                    </button>
                    <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                        <ReportIcon className="w-6 h-6 text-red-500" />
                        {t('dashboard.selectReportPeriod')}
                    </h2>
                    
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">{t('common.month')}</label>
                                <div className="relative">
                                    <select 
                                        value={reportMonth} 
                                        onChange={(e) => setReportMonth(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-800/50 dark:bg-gray-700/50 border border-gray-600/50 rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
                                        style={{ colorScheme: 'dark' }}
                                    >
                                        <option value="" disabled>{t('dashboard.select')}</option>
                                        {monthNames.map((name, index) => (
                                            <option key={index} value={index + 1}>{name}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">{t('common.year')}</label>
                                <div className="relative">
                                    <select 
                                        value={reportYear} 
                                        onChange={(e) => setReportYear(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-800/50 dark:bg-gray-700/50 border border-gray-600/50 rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
                                        style={{ colorScheme: 'dark' }}
                                    >
                                        <option value="" disabled>{t('dashboard.select')}</option>
                                        {years.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {reportError && (
                            <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-500/20 text-center animate-modal-enter">
                                {reportError}
                            </div>
                        )}

                        <button
                            onClick={handleProceedToReport}
                            disabled={!reportMonth || !reportYear}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('dashboard.generateReport')}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {isCalendarOpen && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 animate-modal-overlay-enter p-4"
            onClick={() => setIsCalendarOpen(false)}
          >
            <div
              className="bg-gray-900 dark:bg-gray-800 rounded-lg shadow-xl p-4 w-full max-w-xs text-white animate-modal-enter"
              onClick={(e) => e.stopPropagation()}
            >
              {calendarView === 'days' && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setCalendarDisplayDate(new Date(calendarDisplayDate.setMonth(calendarDisplayDate.getMonth() - 1)))} className="p-2 rounded-full hover:bg-gray-700">&lt;</button>
                    <h3 onClick={() => setCalendarView('years')} className="font-bold text-gray-200 cursor-pointer hover:text-red-500 transition-colors">{calendarDisplayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={() => setCalendarDisplayDate(new Date(calendarDisplayDate.setMonth(calendarDisplayDate.getMonth() + 1)))} className="p-2 rounded-full hover:bg-gray-700">&gt;</button>
                  </div>
                  <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <div key={i}>{day}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => {
                      const isSelected = formData.date && day && new Date(formData.date + 'T00:00:00').getDate() === day && new Date(formData.date + 'T00:00:00').getMonth() === calendarDisplayDate.getMonth() && new Date(formData.date + 'T00:00:00').getFullYear() === calendarDisplayDate.getFullYear();
                      const isToday = new Date().getDate() === day && new Date().getMonth() === calendarDisplayDate.getMonth() && new Date().getFullYear() === calendarDisplayDate.getFullYear();
                      return (
                        <div key={index} className="flex justify-center items-center">
                          {day ? (
                            <button
                              onClick={() => handleDateSelect(day)}
                              className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
                                isSelected 
                                  ? 'bg-red-500 text-white' 
                                  : isToday 
                                    ? 'bg-gray-700 text-red-400 hover:bg-gray-600' 
                                    : 'hover:bg-gray-700 text-gray-200'
                              }`}
                            >
                              {day}
                            </button>
                          ) : <div className="w-9 h-9"></div>}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
              {calendarView === 'years' && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setCalendarDisplayDate(new Date(calendarDisplayDate.setFullYear(calendarDisplayDate.getFullYear() - 12)))} className="p-2 rounded-full hover:bg-gray-700">&lt;</button>
                    <h3 className="font-bold text-gray-200">{`${calendarYearRange[0]} - ${calendarYearRange[11]}`}</h3>
                    <button onClick={() => setCalendarDisplayDate(new Date(calendarDisplayDate.setFullYear(calendarDisplayDate.getFullYear() + 12)))} className="p-2 rounded-full hover:bg-gray-700">&gt;</button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {calendarYearRange.map(year => (
                      <button
                        key={year}
                        onClick={() => handleYearSelect(year)}
                        className={`px-2 py-3 rounded-md transition-colors text-gray-200
                          ${calendarDisplayDate.getFullYear() === year ? 'bg-red-500 text-white' : 'hover:bg-gray-700'}
                        `}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {isTimePickerOpen && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 animate-modal-overlay-enter p-4"
            onClick={() => setIsTimePickerOpen(false)}
          >
            <div
              className="bg-gray-900 dark:bg-gray-800 rounded-lg shadow-xl p-4 w-full max-w-xs text-white animate-modal-enter"
              onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() => setTimePickerView('hours')}
                        className={`p-2 rounded-full hover:bg-gray-700 transition-opacity ${timePickerView === 'hours' ? 'opacity-0 cursor-default' : 'opacity-100'}`}
                        disabled={timePickerView === 'hours'}
                        aria-label="Back to hour selection"
                    >&lt;</button>
                    <h3 className="font-bold text-gray-200">
                        {timePickerView === 'hours' ? t('modal.selectHour') : t('modal.selectMinute')}
                    </h3>
                    <div className="w-8 h-8"></div>
                </div>

                {timePickerView === 'hours' && (
                    <div className="grid grid-cols-6 gap-2 text-center">
                        {Array.from({ length: 24 }, (_, i) => i).map(hour => {
                            const isSelected = formData.time && formData.time.split(':')[0] === String(hour).padStart(2, '0');
                            return (
                                <button
                                    key={hour}
                                    onClick={() => handleHourSelect(hour)}
                                    className={`p-2 rounded-md transition-colors font-mono ${isSelected ? 'bg-red-500 text-white' : 'hover:bg-gray-700 text-gray-200'}`}
                                >
                                    {String(hour).padStart(2, '0')}
                                </button>
                            );
                        })}
                    </div>
                )}
                {timePickerView === 'minutes' && (
                     <div className="grid grid-cols-6 gap-2 text-center h-64 overflow-y-auto no-scrollbar">
                        {Array.from({ length: 60 }, (_, i) => i).map(minute => {
                            const isSelected = formData.time && formData.time.split(':')[1] === String(minute).padStart(2, '0');
                            return (
                                <button
                                    key={minute}
                                    onClick={() => handleMinuteSelect(minute)}
                                    className={`p-2 rounded-md transition-colors font-mono ${isSelected ? 'bg-red-500 text-white' : 'hover:bg-gray-700 text-gray-200'}`}
                                >
                                    {String(minute).padStart(2, '0')}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
          </div>
        )}

        {isDetailModalOpen && selectedReading && (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-[2px] p-4 ${isDetailModalExiting ? 'animate-modal-overlay-exit' : 'animate-modal-overlay-enter'}`}
            onClick={closeDetailModal}
            aria-modal="true"
            role="dialog"
          >
            <div
              className={`relative w-full max-w-2xl mx-4 sm:mx-0 ${isDetailModalExiting ? 'animate-modal-exit' : 'animate-modal-enter'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeDetailModal}
                className="absolute -top-8 right-2 sm:-top-10 sm:right-0 text-gray-400 hover:text-white transition-colors"
                aria-label={t('common.close')}
              >
                <CloseIcon />
              </button>
              <ReadingCard 
                reading={selectedReading} 
                onEdit={() => {
                    if (selectedReading) {
                        closeDetailModal();
                        setTimeout(() => handleStartEdit(selectedReading), 200);
                    }
                }}
                onDelete={() => {
                    if (selectedReading) {
                        closeDetailModal();
                        setTimeout(() => handleDeleteReading(selectedReading.id), 200);
                    }
                }}
                onShare={() => {
                    if (selectedReading) {
                        closeDetailModal();
                        setTimeout(() => openShareModal(selectedReading), 200);
                    }
                }}
              />
            </div>
          </div>
        )}

        {isDeleteConfirmOpen && (
            <div
                className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-[2px] p-4 ${isDeleteConfirmExiting ? 'animate-modal-overlay-exit' : 'animate-modal-overlay-enter'}`}
                onClick={closeDeleteConfirm}
                aria-modal="true"
                role="dialog"
            >
                <div
                    className={`bg-gray-900 dark:bg-gray-800 rounded-lg shadow-2xl p-6 relative w-full max-w-sm text-gray-200 mx-4 sm:mx-0 ${isDeleteConfirmExiting ? 'animate-modal-exit' : 'animate-modal-enter'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-xl font-bold mb-4 text-white">{t('modal.confirmDeleteTitle')}</h2>
                    <p className="text-gray-400 mb-6">
                        {readingToDeleteId === -1 
                            ? t('modal.confirmBulkDeleteMessage', { count: selectedIds.length })
                            : t('modal.confirmDeleteMessage')}
                    </p>
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={closeDeleteConfirm}
                            className="py-2 px-4 border border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                            {t('common.delete')}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {isShareModalOpen && readingToShare && (
          <ShareModal
            reading={readingToShare}
            onClose={closeShareModal}
            isExiting={isShareModalExiting}
            session={session}
            onPreview={onPreviewLink}
          />
        )}
        
        {isBulkShareModalOpen && (
            <BulkShareModal
                readings={readingsToShare}
                onClose={closeBulkShareModal}
                isExiting={isBulkShareModalExiting}
                session={session}
                onPreview={onPreviewLinks}
            />
        )}

      </main>
    </>
  );
};

export default Dashboard;
