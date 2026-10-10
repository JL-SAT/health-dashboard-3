
import { useMemo } from 'react';
import { useI18n } from '../i18n/index';

export const useDateFormatter = () => {
  const { t, language } = useI18n();

  const formatDate = useMemo(() => (
    dateString?: string, 
    options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  ) => {
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return 'N/A';

    const today = new Date();
    const todayDateString = today.toLocaleDateString('sv-SE');
    
    if (dateString === todayDateString) {
      return t('common.today');
    }

    const readingDate = new Date(`${dateString}T00:00:00Z`); // Use Z for UTC to avoid timezone issues
    if (isNaN(readingDate.getTime())) return dateString;
    
    // For Thai locale, we use the Buddhist calendar.
    const locale = language === 'th' ? 'th-TH-u-ca-buddhist' : 'en-US';
    
    return readingDate.toLocaleDateString(locale, options);
  }, [t, language]);

  return { formatDate };
};
