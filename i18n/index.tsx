
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const en = {
  "common": {
    "today": "Today",
    "attended": "Attended",
    "notProvided": "Not provided",
    "save": "Save Changes",
    "add": "Add",
    "cancel": "Cancel",
    "delete": "Delete",
    "share": "Share",
    "preview": "Preview",
    "copied": "Copied!",
    "close": "Close",
    "loading": "Loading...",
    "generating": "Generating...",
    "submitting": "Saving...",
    "error": "Error",
    "date": "Date",
    "time": "Time",
    "systolic": "Systolic",
    "diastolic": "Diastolic",
    "pulse": "Pulse",
    "hospital": "Hospital",
    "doctor": "Doctor",
    "purpose": "Purpose",
    "preNotes": "Pre-Appointment Notes",
    "postNotes": "Post-Appointment Notes",
    "attachments": "Attachments",
    "hours": "hours",
    "minutes": "minutes",
    "day": "Day",
    "month": "Month",
    "year": "Year",
    "search": "Search"
  },
  "auth": {
    "welcomeBack": "Welcome Back",
    "createAccount": "Create Account",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "login": "Login",
    "loggingIn": "Logging in...",
    "creating": "Creating...",
    "needAccount": "Need an account? Sign Up",
    "haveAccount": "Already have an account? Login",
    "signupSuccessTitle": "Account Created!",
    "signupSuccessMessage": "Please check your email and click the verification link to complete your registration.",
    "backToLogin": "Back to Login",
    "appName": "Blood Buddy",
    "appSlogan": "Your personal health companion"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome, {email}",
    "bpButton": "Blood Pressure",
    "appointmentsButton": "Appointments",
    "logout": "Logout",
    "toggleTheme": "Toggle theme",
    "goBack": "Go back to dashboard",
    "createReport": "Create Report",
    "selectReportPeriod": "Select Report Period",
    "generateReport": "Generate Report",
    "noReadingsForPeriod": "No readings found for the selected period.",
    "select": "Select",
    "addNew": "Add new entry",
    "shareSelected": "Share ({count})",
    "deleteSelected": "Delete ({count})",
    "sortBy": "Sort by:",
    "sort": {
      "recent": "Recently Added",
      "oldest": "Oldest Added",
      "dateDesc": "Date (Newest First)",
      "dateAsc": "Date (Oldest First)"
    },
    "noResults": "No Results Found",
    "noResultsHint": "Try adjusting your search criteria.",
    "searchPlaceholder": "Search by hospital, doctor, purpose...",
    "emptyState": {
      "bp": "No readings recorded yet.",
      "appt": "No appointments recorded yet.",
      "hint": "Click the '+' button to add your first entry."
    },
    "loadingData": "Loading data..."
  },
  "readingCard": {
    "bpTitle": "Blood Pressure Reading",
    "mmhg": "mmHg",
    "bpm": "bpm",
    "attendedBadge": "Attended",
    "generatingLink": "Generating secure link...",
    "attachments": "Attachments",
    "dateTime": "{date} at {time}"
  },
  "modal": {
    "addBpTitle": "Add Blood Pressure Reading",
    "editBpTitle": "Edit Blood Pressure Reading",
    "addApptTitle": "Add Appointment",
    "editApptTitle": "Edit Appointment",
    "systolicLabel": "Systolic (SYS)",
    "diastolicLabel": "Diastolic (DIA)",
    "pulseLabel": "Pulse (BPM)",
    "extract": "Extract from Image",
    "extractHint": "Upload a photo of your reading to fill the fields automatically.",
    "analyzing": "Analyzing...",
    "aiError": "Could not extract readings. Please enter manually.",
    "selectDate": "Select a date",
    "selectTime": "Select time",
    "selectHour": "Select Hour",
    "selectMinute": "Select Minute",
    "uploadFile": "Upload files",
    "dragDrop": "or drag and drop",
    "fileTypes": "PNG, JPG, PDF, etc.",
    "addReading": "Add Reading",
    "addAppointment": "Add Appointment",
    "confirmDeleteTitle": "Confirm Deletion",
    "confirmDeleteMessage": "Are you sure you want to delete this item? This action cannot be undone.",
    "confirmBulkDeleteMessage": "Are you sure you want to delete these {count} items? This action cannot be undone."
  },
  "share": {
    "title": "Share Health Log",
    "titleBulk": "Share Multiple Logs",
    "tabLink": "Share Link",
    "tabPdf": "Download as PDF",
    "expiration": "Link Expiration",
    "neverExpires": "Never expires",
    "generateLink": "Generate Link",
    "generatingLink": "Please wait...",
    "linkReady": "Your secure link is ready:",
    "expiresIn": "Expires {time}",
    "expiresNever": "Expires Never",
    "pdfHint": "A PDF of this health log will be downloaded to your device.",
    "pdfHintBulk": "A single PDF containing all {count} selected health logs will be generated.",
    "downloadPdf": "Download as PDF"
  },
  "sharedViewer": {
    "loading": "Loading shared log(s)...",
    "accessDenied": "Access Denied",
    "error": "The shared link(s) could not be found or have expired.",
    "errorSome": "Some shared logs could not be loaded. They may have expired.",
    "errorUnexpected": "An unexpected error occurred.",
    "footer": "This is a read-only shared health log from Blood Buddy."
  }
};

const th = {
  "common": {
    "today": "วันนี้",
    "attended": "เข้าร่วมแล้ว",
    "notProvided": "ไม่ได้ระบุ",
    "save": "บันทึกการเปลี่ยนแปลง",
    "add": "เพิ่ม",
    "cancel": "ยกเลิก",
    "delete": "ลบ",
    "share": "แชร์",
    "preview": "ดูตัวอย่าง",
    "copied": "คัดลอกแล้ว!",
    "close": "ปิด",
    "loading": "กำลังโหลด...",
    "generating": "กำลังสร้าง...",
    "submitting": "กำลังบันทึก...",
    "error": "เกิดข้อผิดพลาด",
    "date": "วันที่",
    "time": "เวลา",
    "systolic": "ค่าบน",
    "diastolic": "ค่าล่าง",
    "pulse": "ชีพจร",
    "hospital": "โรงพยาบาล",
    "doctor": "แพทย์",
    "purpose": "วัตถุประสงค์",
    "preNotes": "บันทึกก่อนพบแพทย์",
    "postNotes": "บันทึกหลังพบแพทย์",
    "attachments": "ไฟล์แนบ",
    "hours": "ชั่วโมง",
    "minutes": "นาที",
    "day": "วัน",
    "month": "เดือน",
    "year": "ปี",
    "search": "ค้นหา"
  },
  "auth": {
    "welcomeBack": "ยินดีต้อนรับกลับ",
    "createAccount": "สร้างบัญชี",
    "email": "อีเมล",
    "password": "รหัสผ่าน",
    "confirmPassword": "ยืนยันรหัสผ่าน",
    "login": "เข้าสู่ระบบ",
    "loggingIn": "กำลังเข้าสู่ระบบ...",
    "creating": "กำลังสร้างบัญชี...",
    "needAccount": "ยังไม่มีบัญชี? สมัครสมาชิก",
    "haveAccount": "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ",
    "signupSuccessTitle": "สร้างบัญชีสำเร็จ!",
    "signupSuccessMessage": "โปรดตรวจสอบอีเมลของคุณและคลิกลิงก์ยืนยันเพื่อทำการลงทะเบียนให้เสร็จสมบูรณ์",
    "backToLogin": "กลับไปที่หน้าเข้าสู่ระบบ",
    "appName": "Blood Buddy",
    "appSlogan": "เพื่อนคู่ใจด้านสุขภาพของคุณ"
  },
  "dashboard": {
    "title": "แดชบอร์ด",
    "welcome": "ยินดีต้อนรับ, {email}",
    "bpButton": "ความดันโลหิต",
    "appointmentsButton": "การนัดหมาย",
    "logout": "ออกจากระบบ",
    "toggleTheme": "สลับธีม",
    "goBack": "กลับไปที่แดชบอร์ด",
    "createReport": "สร้างรายงาน",
    "selectReportPeriod": "เลือกช่วงเวลารายงาน",
    "generateReport": "สร้างรายงาน",
    "noReadingsForPeriod": "ไม่พบข้อมูลในช่วงเวลาที่เลือก",
    "select": "เลือก",
    "addNew": "เพิ่มรายการใหม่",
    "shareSelected": "แชร์ ({count})",
    "deleteSelected": "ลบ ({count})",
    "sortBy": "เรียงตาม:",
    "sort": {
      "recent": "เพิ่มล่าสุด",
      "oldest": "เพิ่มเก่าสุด",
      "dateDesc": "วันที่ (ใหม่สุดก่อน)",
      "dateAsc": "วันที่ (เก่าสุดก่อน)"
    },
    "noResults": "ไม่พบผลลัพธ์",
    "noResultsHint": "ลองปรับเปลี่ยนเกณฑ์การค้นหาของคุณ",
    "searchPlaceholder": "ค้นหาจากโรงพยาบาล, แพทย์, วัตถุประสงค์...",
    "emptyState": {
      "bp": "ยังไม่มีการบันทึกค่าความดัน",
      "appt": "ยังไม่มีการบันทึกการนัดหมาย",
      "hint": "คลิกปุ่ม '+' เพื่อเพิ่มรายการแรกของคุณ"
    },
    "loadingData": "กำลังโหลดข้อมูล..."
  },
  "readingCard": {
    "bpTitle": "ค่าความดันโลหิต",
    "mmhg": "มม.ปรอท",
    "bpm": "ครั้ง/นาที",
    "attendedBadge": "เข้าร่วมแล้ว",
    "generatingLink": "กำลังสร้างลิงก์ที่ปลอดภัย...",
    "attachments": "ไฟล์แนบ",
    "dateTime": "{date} เวลา {time}"
  },
  "modal": {
    "addBpTitle": "เพิ่มค่าความดันโลหิต",
    "editBpTitle": "แก้ไขค่าความดันโลหิต",
    "addApptTitle": "เพิ่มการนัดหมาย",
    "editApptTitle": "แก้ไขการนัดหมาย",
    "systolicLabel": "ค่าบน (SYS)",
    "diastolicLabel": "ค่าล่าง (DIA)",
    "pulseLabel": "ชีพจร (BPM)",
    "extract": "ดึงข้อมูลจากรูปภาพ",
    "extractHint": "อัปโหลดรูปภาพค่าความดันของคุณเพื่อกรอกข้อมูลโดยอัตโนมัติ",
    "analyzing": "กำลังวิเคราะห์...",
    "aiError": "ไม่สามารถดึงข้อมูลได้ กรุณากรอกด้วยตนเอง",
    "selectDate": "เลือกวันที่",
    "selectTime": "เลือกเวลา",
    "selectHour": "เลือกชั่วโมง",
    "selectMinute": "เลือกนาที",
    "uploadFile": "อัปโหลดไฟล์",
    "dragDrop": "หรือลากและวาง",
    "fileTypes": "PNG, JPG, PDF, ฯลฯ",
    "addReading": "เพิ่มค่าที่วัดได้",
    "addAppointment": "เพิ่มการนัดหมาย",
    "confirmDeleteTitle": "ยืนยันการลบ",
    "confirmDeleteMessage": "คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้",
    "confirmBulkDeleteMessage": "คุณแน่ใจหรือไม่ว่าต้องการลบ {count} รายการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
  },
  "share": {
    "title": "แชร์บันทึกสุขภาพ",
    "titleBulk": "แชร์หลายบันทึก",
    "tabLink": "แชร์ลิงก์",
    "tabPdf": "ดาวน์โหลดเป็น PDF",
    "expiration": "ลิงก์หมดอายุ",
    "neverExpires": "ไม่มีวันหมดอายุ",
    "generateLink": "สร้างลิงก์",
    "generatingLink": "กรุณารอสักครู่...",
    "linkReady": "ลิงก์ที่ปลอดภัยของคุณพร้อมแล้ว:",
    "expiresIn": "หมดอายุใน {time}",
    "expiresNever": "ไม่มีวันหมดอายุ",
    "pdfHint": "ไฟล์ PDF ของบันทึกสุขภาพนี้จะถูกดาวน์โหลดไปยังอุปกรณ์ของคุณ",
    "pdfHintBulk": "ไฟล์ PDF ไฟล์เดียวที่ประกอบด้วยบันทึกสุขภาพที่เลือกทั้งหมด {count} รายการจะถูกสร้างขึ้น",
    "downloadPdf": "ดาวน์โหลดเป็น PDF"
  },
  "sharedViewer": {
    "loading": "กำลังโหลดบันทึกที่แชร์...",
    "accessDenied": "การเข้าถึงถูกปฏิเสธ",
    "error": "ไม่พบลิงก์ที่แชร์หรือลิงก์หมดอายุแล้ว",
    "errorSome": "ไม่สามารถโหลดบันทึกที่แชร์บางรายการได้ อาจหมดอายุแล้ว",
    "errorUnexpected": "เกิดข้อผิดพลาดที่ไม่คาดคิด",
    "footer": "นี่คือบันทึกสุขภาพสำหรับอ่านอย่างเดียวจาก Blood Buddy"
  }
};

type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const resources = {
  en,
  th
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState(() => localStorage.getItem('language') || 'en');

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: string) => {
    if (Object.prototype.hasOwnProperty.call(resources, lang)) {
      setLanguageState(lang);
    }
  };

  const t = useCallback((key: string, replacements?: { [key: string]: string | number }): string => {
    const langResources = resources[language as keyof typeof resources] as any;
    
    let translation = key.split('.').reduce((acc, k) => acc?.[k], langResources);

    if (typeof translation !== 'string') {
      // Fallback to English if translation is missing in the current language
      const enResources = resources['en'] as any;
      translation = key.split('.').reduce((acc, k) => acc?.[k], enResources);
      
      if (typeof translation !== 'string') {
        console.warn(`Translation key not found: "${key}"`);
        return key; // Return the key if no translation is found at all
      }
    }

    if (replacements) {
      Object.keys(replacements).forEach(rKey => {
        const regex = new RegExp(`{${rKey}}`, 'g');
        translation = translation.replace(regex, String(replacements[rKey]));
      });
    }

    return translation;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useI18n = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useI18n must be used within a LanguageProvider');
  }
  return context;
};
