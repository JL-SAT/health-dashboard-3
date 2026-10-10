
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import HeartbeatIcon from './components/icons/HeartbeatIcon';
import EmailIcon from './components/icons/EmailIcon';
import PasswordIcon from './components/icons/PasswordIcon';
import SunIcon from './components/icons/SunIcon';
import MoonIcon from './components/icons/MoonIcon';
import BackArrowIcon from './components/icons/BackArrowIcon';
import { useI18n } from './i18n/index';
import LanguageSwitcher from './components/LanguageSwitcher';

interface AuthPageProps {
  onBackToOverview?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onBackToOverview }) => {
  const { t, language } = useI18n();
  // ... (rest of the file remains exactly the same logic-wise)
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const gridStyle: React.CSSProperties = {
    backgroundImage: theme === 'dark' 
      ? `linear-gradient(to right, rgba(220, 38, 38, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(220, 38, 38, 0.3) 1px, transparent 1px)`
      : `linear-gradient(to right, rgba(156, 163, 175, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(156, 163, 175, 0.3) 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
    animation: 'slideGrid 1s linear infinite',
  };

  const handleToggleView = () => {
    setIsLoginView(prev => !prev);
    setError('');
    setPassword('');
    setConfirmPassword('');
    setSignupSuccess(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSignupSuccess(false);

    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
    }

    if (isLoginView) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setSignupSuccess(true);
      }
    }
    setLoading(false);
  };

  return (
    <>
    <style>{`
      @keyframes slideGrid { from { background-position: 0 0; } to { background-position: -40px -40px; } }
      @keyframes shine { to { background-position: 200% center; } }
      
      @keyframes content-enter { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
      .animate-content-enter { animation: content-enter 0.5s ease-out forwards; }
      
      @keyframes error-enter { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      .animate-error-enter { animation: error-enter 0.3s ease-out forwards; }

      @keyframes heartbeat {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      .animate-heartbeat { animation: heartbeat 1.5s ease-in-out infinite; }
      
      @keyframes aurora {
        from { background-position: 50% 0%; }
        to { background-position: 50% 100%; }
      }
    `}</style>
    <main className="h-screen w-full flex flex-col items-center justify-center p-4 font-sans select-none overflow-hidden bg-gray-200 dark:bg-black relative animate-content-enter transition-colors duration-500">
        {onBackToOverview && (
          <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-20">
            <button
              onClick={onBackToOverview}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/70 dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700/60 backdrop-blur-md text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 hover:border-red-400/50 transition-all shadow-sm hover:shadow focus:outline-none"
              aria-label="Back to project overview"
            >
              <span className="w-4 h-4 flex items-center justify-center">
                <BackArrowIcon />
              </span>
              <span className="hidden sm:inline">{language === 'th' ? 'ข้อมูลแอป' : 'About App'}</span>
            </button>
          </div>
        )}
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-20 flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={toggleTheme}
              className="bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-500/50 rounded-full p-3 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-all duration-300 ease-in-out shadow-md hover:shadow-lg dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] ring-1 ring-black/5 dark:ring-0 hover:ring-2 hover:ring-gray-500/50 dark:hover:ring-white/50"
              aria-label={t('dashboard.toggleTheme')}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
        </div>
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

        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
            <div className="text-center mb-8">
                <div className="flex justify-center items-center mb-4 text-red-500 animate-heartbeat">
                    <HeartbeatIcon />
                </div>
                <h1
                  className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-red-500 via-gray-900 to-red-600 dark:from-red-400 dark:via-white dark:to-red-500 bg-clip-text text-transparent animate-[shine_3s_linear_infinite] dark:[text-shadow:0_0_12px_rgba(239,68,68,0.7)]"
                  style={{ backgroundSize: '200% auto' }}
                >
                  {t('auth.appName')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                  {t('auth.appSlogan')}
                </p>
            </div>

            <div className="w-full max-w-sm bg-white/30 dark:bg-gray-900/80 border border-gray-300 dark:border-red-900/50 rounded-2xl p-8 backdrop-blur-lg shadow-2xl transition-all duration-500">
                {signupSuccess ? (
                    <div className="text-center text-gray-800 dark:text-white animate-content-enter">
                        <h2 className="text-2xl font-bold mb-4">{t('auth.signupSuccessTitle')}</h2>
                        <p className="mb-6 text-gray-600 dark:text-gray-300">
                            {t('auth.signupSuccessMessage')}
                        </p>
                        <button 
                            onClick={() => {
                                setSignupSuccess(false);
                                setIsLoginView(true);
                            }}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-all duration-300"
                        >
                            {t('auth.backToLogin')}
                        </button>
                    </div>
                ) : (
                <>
                    <h2 className="relative text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white h-8 flex items-center justify-center transition-colors duration-500">
                        <span className={`absolute transition-opacity duration-200 ease-in-out ${isLoginView ? 'opacity-100' : 'opacity-0'}`}>
                            {t('auth.welcomeBack')}
                        </span>
                        <span className={`absolute transition-opacity duration-200 ease-in-out ${!isLoginView ? 'opacity-100' : 'opacity-0'}`}>
                            {t('auth.createAccount')}
                        </span>
                    </h2>
                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        <div className="relative">
                            <EmailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-500" />
                            <input type="email" name="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required 
                            className="block w-full rounded-md border-0 bg-gray-200/50 dark:bg-gray-700/50 py-3 pl-10 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-400/50 dark:ring-gray-600/50 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.5)] text-base transition-shadow" 
                            placeholder={t('auth.email')}
                            />
                        </div>
                        <div className="relative">
                            <PasswordIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-500" />
                            <input type="password" name="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required 
                            className="block w-full rounded-md border-0 bg-gray-200/50 dark:bg-gray-700/50 py-3 pl-10 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-400/50 dark:ring-gray-600/50 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.5)] text-base transition-shadow"
                            placeholder={t('auth.password')}
                            />
                        </div>
                        
                        <div className={`grid transition-all duration-300 ease-in-out ${isLoginView ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'}`}>
                            <div className="overflow-hidden">
                                <div className="relative">
                                    <PasswordIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-500" />
                                    <input type="password" name="confirmPassword" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required={!isLoginView} 
                                    className="block w-full rounded-md border-0 bg-gray-200/50 dark:bg-gray-700/50 py-3 pl-10 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-400/50 dark:ring-gray-600/50 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.5)] text-base transition-shadow"
                                    placeholder={t('auth.confirmPassword')}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-500 dark:text-red-400 text-center animate-error-enter">{error}</p>}
                        <div>
                            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-all duration-300 transform hover:scale-105 hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed">
                                <span className="relative block h-5 w-28 text-center">
                                    <span className={`absolute inset-0 transition-opacity duration-200 ease-in-out ${isLoginView ? 'opacity-100' : 'opacity-0'}`}>
                                        {loading && isLoginView ? t('auth.loggingIn') : t('auth.login')}
                                    </span>
                                    <span className={`absolute inset-0 transition-opacity duration-200 ease-in-out ${!isLoginView ? 'opacity-100' : 'opacity-0'}`}>
                                        {loading && !isLoginView ? t('auth.creating') : t('auth.createAccount')}
                                    </span>
                                </span>
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <button onClick={handleToggleView} className="relative text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors h-5 w-64">
                            <span className={`absolute inset-0 transition-opacity duration-200 ease-in-out ${isLoginView ? 'opacity-100' : 'opacity-0'}`}>
                                {t('auth.needAccount')}
                            </span>
                            <span className={`absolute inset-0 transition-opacity duration-200 ease-in-out ${!isLoginView ? 'opacity-100' : 'opacity-0'}`}>
                                {t('auth.haveAccount')}
                            </span>
                        </button>
                    </div>
                </>
                )}
            </div>
        </div>
    </main>
    </>
  );
};

export default AuthPage;
