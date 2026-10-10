import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';
import AuthPage from './AuthPage';
import Dashboard from './Dashboard';
import SharedLogViewer from './SharedLogViewer';
import LandingPage from './LandingPage';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sharedLogUuid, setSharedLogUuid] = useState<string | null>(null);
  const [sharedLogUuids, setSharedLogUuids] = useState<string | null>(null);
  const [previewUuid, setPreviewUuid] = useState<string | null>(null);
  const [previewUuids, setPreviewUuids] = useState<string | null>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = window.localStorage.getItem('theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const [showLanding, setShowLanding] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('intro') === 'true') return true;
    if (params.get('share') || params.get('share_bulk')) return false;
    // Default to true for first-time visitors who haven't entered the app yet
    const hasVisited = window.localStorage.getItem('blood_buddy_has_visited');
    return !hasVisited;
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
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('share');
    const shareBulkIds = params.get('share_bulk');

    if (shareBulkIds) {
        setSharedLogUuids(shareBulkIds);
        setIsLoading(false);
    } else if (shareId) {
        setSharedLogUuid(shareId);
        setIsLoading(false);
    } else {
        // Check for an active session initially
        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
          setIsLoading(false);
        });

        // Listen for changes in auth state (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
        });

        // Cleanup the subscription when the component unmounts
        return () => subscription.unsubscribe();
    }
  }, []);

  // Display a loading state while checking for an active session
  if (isLoading) {
    return (
        <main className="h-screen w-full flex items-center justify-center bg-gray-200 dark:bg-black" />
    );
  }

  if (sharedLogUuids) {
    return <SharedLogViewer uuids={sharedLogUuids} />;
  }
  if (sharedLogUuid) {
    return <SharedLogViewer uuid={sharedLogUuid} />;
  }

  const handleLaunchApp = () => {
    window.localStorage.setItem('blood_buddy_has_visited', 'true');
    setShowLanding(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLanding = () => {
    setShowLanding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showLanding) {
    return (
      <LandingPage
        onGetStarted={handleLaunchApp}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <>
      {session ? (
        <>
          <Dashboard 
            session={session} 
            onPreviewLink={setPreviewUuid} 
            onPreviewLinks={setPreviewUuids}
            onViewOverview={handleOpenLanding}
          />
          {(previewUuid || previewUuids) && (
            <div className="fixed inset-0 z-[100]">
              <SharedLogViewer 
                uuid={previewUuid ?? undefined} 
                uuids={previewUuids ?? undefined}
                onBackToDashboard={() => {
                  setPreviewUuid(null);
                  setPreviewUuids(null);
                }} 
              />
            </div>
          )}
        </>
      ) : (
        <AuthPage onBackToOverview={handleOpenLanding} />
      )}
    </>
  );
};

export default App;