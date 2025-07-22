import React from 'react';
import { Settings, Monitor, BarChart3 } from 'lucide-react';

interface NavigationProps {
  currentView: 'admin' | 'projector' | 'scoreboard';
  onViewChange: (view: 'admin' | 'projector' | 'scoreboard') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const views = [
    { id: 'admin' as const, label: 'Admin Panel', icon: Settings },
    { id: 'projector' as const, label: 'Projector View', icon: Monitor },
    { id: 'scoreboard' as const, label: 'Scoreboard', icon: BarChart3 },
  ];

  return (
    <div className="fixed top-6 left-6 z-50">
      <div className="flex gap-2 bg-black/80 backdrop-blur-md rounded-xl p-2">
        {views.map(view => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentView === view.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span className="font-medium">{view.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;