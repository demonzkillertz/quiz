import React, { memo } from 'react';
import { useQuiz } from '../contexts/QuizContext';
import { Trophy, Medal, Award } from 'lucide-react';
import { getRoundStats } from './AdminPanel';

const Scoreboard: React.FC = () => {
  const { state } = useQuiz();
  const sortedTeams = [...state.teams].sort((a, b) => b.score - a.score);
  const stats = getRoundStats(state);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="text-yellow-500" size={32} />;
      case 2:
        return <Medal className="text-gray-400" size={28} />;
      case 3:
        return <Award className="text-orange-600" size={24} />;
      default:
        return <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">{position}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Live Scoreboard</h1>
          <div className="inline-block px-6 py-3 bg-white/20 rounded-full">
            <span className="text-white text-xl font-semibold">
              Progress: {stats.totalUsed}/{stats.totalQuestions} Questions
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
            <h3 className="text-white text-lg font-semibold mb-2">General Round</h3>
            <p className="text-2xl font-bold text-blue-300">{stats.generalUsed}/{stats.generalTotal}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
            <h3 className="text-white text-lg font-semibold mb-2">AV Round</h3>
            <p className="text-2xl font-bold text-purple-300">{stats.avUsed}/{stats.avTotal}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
            <h3 className="text-white text-lg font-semibold mb-2">Rapid-Fire Round</h3>
            <p className="text-2xl font-bold text-orange-300">{stats.rapidFireUsed}/{stats.rapidFireTotal}</p>
          </div>
        </div>

        <div className="space-y-4" role="region" aria-label="Scoreboard">
          {sortedTeams.map((team, index) => (
            <div
              key={team.id}
              className={`flex items-center p-6 bg-white/10 backdrop-blur-md rounded-xl border-l-8 ${team.color} transform transition-all duration-300 hover:scale-105 animate-pulse-on-update`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center justify-center w-16">
                  {getPositionIcon(index + 1)}
                </div>
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full ${team.color}`}></div>
                  <h3 className="text-2xl font-bold text-white">{team.name}</h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-white">{team.score}</p>
                <p className="text-gray-300">points</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-block px-8 py-4 bg-white/20 rounded-full">
            <span className="text-white text-xl font-semibold">
              Current Round: {state.currentRound === 'general' ? 'General Questions' : state.currentRound === 'av' ? 'Audio-Visual Questions' : 'Rapid-Fire Questions'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Scoreboard);