import React, { useState } from 'react';
import { useQuiz } from '../contexts/QuizContext';

const Winner: React.FC = () => {
  const { state } = useQuiz();
  const [showCongratulations, setShowCongratulations] = useState(false);

  const sortedTeams = [...state.teams].sort((a, b) => b.score - a.score);

  const handleCongratulations = () => {
    setShowCongratulations(true);
    const audio = new Audio('/media/congratulations.mp3');
    audio.play().catch(error => console.error('Error playing congratulations sound:', error));
    setTimeout(() => setShowCongratulations(false), 3000); // Reset animation after 3s
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
      {/* Leaderboard (Left Side) */}
      <div className="w-1/4 p-4 bg-gray-800 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-400">Leaderboard</h2>
        {sortedTeams.map((team, index) => (
          <div
            key={team.id}
            className={`flex items-center gap-2 p-2 mb-2 rounded-lg ${team.color} text-white font-semibold`}
          >
            <span className="text-lg">{index + 1}. {team.name}</span>
            <span className="text-lg">{team.score} pts</span>
          </div>
        ))}
      </div>

      {/* Winner and Congratulations (Center) */}
      <div className="w-3/4 flex flex-col items-center justify-center p-8">
        <h1 className="text-6xl font-bold mb-8 text-blue-400">
          Winner: {state.winningTeamName || 'TBA'}
        </h1>
        <button
          onClick={handleCongratulations}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-xl font-semibold"
        >
          Show Congratulations
        </button>
        {showCongratulations && (
          <p className="text-4xl text-yellow-400 mt-4 animate-bounce animate-pulse">
            Congratulations!
          </p>
        )}
      </div>
    </div>
  );
};

export default Winner;