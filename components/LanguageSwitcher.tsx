
import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../i18n/index';
import GlobeIcon from './icons/GlobeIcon';

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const languages: { [key: string]: string } = {
        en: 'English',
        th: 'ไทย',
    };

    const handleLanguageChange = (langCode: string) => {
        setLanguage(langCode);
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-500/50 rounded-full p-3 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-all duration-300 ease-in-out shadow-md hover:shadow-lg dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] ring-1 ring-black/5 dark:ring-0 hover:ring-2 hover:ring-gray-500/50 dark:hover:ring-white/50"
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label="Change language"
            >
                <GlobeIcon />
            </button>
            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-36 origin-top-right rounded-md shadow-lg bg-white/50 dark:bg-gray-900/80 ring-1 ring-black ring-opacity-5 dark:ring-gray-500/50 backdrop-blur-sm focus:outline-none animate-page-enter"
                    role="menu"
                    aria-orientation="vertical"
                >
                    <div className="py-1" role="none">
                        {Object.entries(languages).map(([code, name]) => (
                            <button
                                key={code}
                                onClick={() => handleLanguageChange(code)}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                    language === code
                                        ? 'bg-red-500/20 text-red-700 dark:text-red-300'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                                }`}
                                role="menuitem"
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
