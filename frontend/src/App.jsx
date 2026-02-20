import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AnalyzeForm from './components/AnalyzeForm';
import ResultsPanel from './components/ResultsPanel';
import HistoryDashboard from './components/HistoryDashboard';

const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.25 },
};

function App() {
  const [page, setPage] = useState('home'); // home | analyze | history | result
  const [analysisResult, setAnalysisResult] = useState(null);

  const navigate = (dest) => {
    setPage(dest);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResult = (data) => {
    setAnalysisResult(data.result);
    navigate('result');
  };

  const handleViewHistoryResult = (record) => {
    setAnalysisResult(record);
    navigate('result');
  };

  return (
    <div className="min-h-screen">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e1b4b',
            color: '#e0e7ff',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '12px',
          },
        }}
      />
      <Navbar activePage={page === 'result' ? 'analyze' : page} onNavigate={navigate} />

      <main className="pt-20">
        <AnimatePresence mode="wait">
          {page === 'home' && (
            <motion.div key="home" {...PAGE_TRANSITION}>
              <HeroSection onGetStarted={navigate} />
            </motion.div>
          )}
          {page === 'analyze' && (
            <motion.div key="analyze" {...PAGE_TRANSITION}>
              <AnalyzeForm onResult={handleResult} />
            </motion.div>
          )}
          {page === 'result' && analysisResult && (
            <motion.div key="result" {...PAGE_TRANSITION}>
              <ResultsPanel
                result={analysisResult}
                onAnalyzeAnother={() => navigate('analyze')}
              />
            </motion.div>
          )}
          {page === 'history' && (
            <motion.div key="history" {...PAGE_TRANSITION}>
              <HistoryDashboard onViewResult={handleViewHistoryResult} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-600 text-sm">
        <p>ResumeAI — Powered by Google Gemini Pro &amp; Built with ❤️</p>
      </footer>
    </div>
  );
}

export default App;
