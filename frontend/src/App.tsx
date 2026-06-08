import { useState } from 'react';
import { ViewState } from '@/types';
import { Header, Footer } from '@/layouts';
import { HomePage, DiscoverPage, DetailPage, ReaderPage } from '@/pages';
import { AuthProvider } from '@/contexts/AuthContext';
import { AnimatePresence, motion } from 'motion/react';

const viewVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.25 } }
};

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [currentStoryId, setCurrentStoryId] = useState<string | undefined>(undefined);

  // Scroll to top on view change
  const navigate = (view: ViewState, storyId?: string) => {
    setCurrentView(view);
    setCurrentStoryId(storyId);
    window.scrollTo(0, 0);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col font-ui text-on-background bg-background relative selection:bg-primary/20 selection:text-primary">
        <Header currentView={currentView} onNavigate={navigate} />
        
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div key="home" variants={viewVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col w-full">
              <HomePage onNavigate={navigate} />
            </motion.div>
          )}
          {currentView === 'discover' && (
            <motion.div key="discover" variants={viewVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col w-full">
              <DiscoverPage onNavigate={navigate} />
            </motion.div>
          )}
          {currentView === 'detail' && (
            <motion.div key="detail" variants={viewVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col w-full">
              <DetailPage onNavigate={navigate} storyId={currentStoryId} />
            </motion.div>
          )}
          {currentView === 'reader' && (
            <motion.div key="reader" variants={viewVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col w-full">
              <ReaderPage onNavigate={navigate} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {currentView !== 'reader' && <Footer currentView={currentView} />}
      </div>
    </AuthProvider>
  );
}
