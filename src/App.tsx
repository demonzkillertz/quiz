import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QuizProvider } from './contexts/QuizContext';
import AdminPanel from './components/AdminPanel';
import ProjectorView from './components/ProjectorView';
import Scoreboard from './components/ScoreBoard';
import Navigation from './components/Navigation';

function App() {
  const [currentView, setCurrentView] = useState<'admin' | 'projector' | 'scoreboard'>('admin');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'admin':
        return <AdminPanel />;
      case 'projector':
        return <ProjectorView />;
      case 'scoreboard':
        return <Scoreboard />;
      default:
        return <AdminPanel />;
    }
  };

  return (
    <QuizProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <div className="relative">
                <Toaster position="top-right" />
                <Navigation currentView={currentView} onViewChange={setCurrentView} />
                {renderCurrentView()}
              </div>
            }
          />
          <Route path="/presentation" element={<ProjectorView />} />
        </Routes>
      </BrowserRouter>
    </QuizProvider>
  );
}

export default App;