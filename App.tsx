import React, { useState } from 'react';
import Dashboard from './components/layout/Dashboard';
import ComparisonDashboard from './components/ComparisonDashboard';

function App() {
  const [currentView, setCurrentView] = useState<'main' | 'comparison'>('main');

  return (
    <div>
      {currentView === 'main' ? (
        <Dashboard onNavigateToComparison={() => setCurrentView('comparison')} />
      ) : (
        <ComparisonDashboard onNavigateToMain={() => setCurrentView('main')} />
      )}
    </div>
  );
}

export default App;

