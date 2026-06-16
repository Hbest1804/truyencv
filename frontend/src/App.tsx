import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Header, Footer } from '@/layouts';
import { HomePage, DiscoverPage, DetailPage, ReaderPage, ProfilePage, LoginPage, RegisterPage } from '@/pages';
import { AuthProvider } from '@/contexts/AuthContext';
import { AnimatePresence, motion } from 'motion/react';

const viewVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.25 } }
};

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col font-ui text-on-background bg-background relative selection:bg-primary/20 selection:text-primary">
        <ScrollToTop />
        <Header />
        
        <AnimatePresence mode="wait">
          <Routes location={location} {...({ key: location.pathname } as any)}>
            <Route
              path="/"
              element={
                <motion.div variants={viewVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col w-full">
                  <HomePage />
                </motion.div>
              }
            />
            <Route
              path="/discover"
              element={
                <motion.div variants={viewVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col w-full">
                  <DiscoverPage />
                </motion.div>
              }
            />
            <Route
              path="/stories/:storyId"
              element={
                <motion.div variants={viewVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col w-full">
                  <DetailPage />
                </motion.div>
              }
            />
            <Route
              path="/stories/:storyId/reader"
              element={
                <motion.div variants={viewVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col w-full">
                  <ReaderPage />
                </motion.div>
              }
            />
            <Route
              path="/stories/:storyId/reader/:chapterId"
              element={
                <motion.div variants={viewVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col w-full">
                  <ReaderPage />
                </motion.div>
              }
            />
            <Route
              path="/profile"
              element={
                <motion.div variants={viewVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col w-full">
                  <ProfilePage />
                </motion.div>
              }
            />
            <Route
              path="/login"
              element={
                <motion.div variants={viewVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col w-full">
                  <LoginPage />
                </motion.div>
              }
            />
            <Route
              path="/register"
              element={
                <motion.div variants={viewVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col w-full">
                  <RegisterPage />
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
        
        <Footer />
      </div>
    </AuthProvider>
  );
}
