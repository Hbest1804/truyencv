import { useState } from 'react';
import { ViewState } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { DiscoverView } from './components/DiscoverView';
import { DetailView } from './components/DetailView';
import { ReaderView } from './components/ReaderView';
import { AnimatePresence, motion } from 'motion/react';

const viewVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.25 } }
};

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');

  // Scroll to top on view change
  const navigate = (view: ViewState) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col font-ui text-on-background bg-background relative selection:bg-primary/20 selection:text-primary">
      <Header currentView={currentView} onNavigate={navigate} />
      
      <AnimatePresence mode="wait">
        {currentView === 'home' && (
          <motion.div key="home" variants={viewVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col w-full">
            <HomeView onNavigate={navigate} />
          </motion.div>
        )}
        {currentView === 'discover' && (
          <motion.div key="discover" variants={viewVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col w-full">
            <DiscoverView onNavigate={navigate} />
          </motion.div>
        )}
        {currentView === 'detail' && (
          <motion.div key="detail" variants={viewVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col w-full">
            <DetailView onNavigate={navigate} />
          </motion.div>
        )}
        {currentView === 'reader' && (
          <motion.div key="reader" variants={viewVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col w-full">
            <ReaderView onNavigate={navigate} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {currentView !== 'reader' && <Footer currentView={currentView} />}
    </div>
  );
}

