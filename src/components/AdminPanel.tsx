import React, { useState, useCallback } from 'react';
import { useQuiz } from '../contexts/QuizContext';
import { Play, Eye, Trophy, RotateCcw, RefreshCw, Database, Trash2, Clock, Pause, RotateCw, FastForward } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const getRoundStats = (state: any) => {
  const generalUsed = state.generalQuestions.filter(q => q.used).length;
  const generalTotal = state.generalQuestions.length;
  const avUsed = state.avQuestions.filter(q => q.used).length;
  const avTotal = state.avQuestions.length;
  const extraUsed = state.extraQuestions.filter(q => q.used).length;
  const extraTotal = state.extraQuestions.length;
  return {
    generalUsed,
    generalTotal,
    avUsed,
    avTotal,
    extraUsed,
    extraTotal,
    totalUsed: generalUsed + avUsed + extraUsed,
    totalQuestions: generalTotal + avTotal + extraTotal
  };
};

const AdminPanel: React.FC = () => {
  const { state, updateQuizState, refreshState } = useQuiz();
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [isResetting, setIsResetting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const [teamNames, setTeamNames] = useState<{ [key: number]: string }>(
    state.teams.reduce((acc, team) => ({ ...acc, [team.id]: team.name }), {})
  );

  const currentQuestions = state.currentRound === 'general'
    ? state.generalQuestions
    : state.currentRound === 'av'
    ? state.avQuestions
    : state.currentRound === 'extra'
    ? state.extraQuestions
    : [];

  const availableQuestions = currentQuestions.filter(q => !q.used);

  const handleQuestionSelect = useCallback(async () => {
    const questionId = parseInt(selectedQuestionId);
    const teamId = state.currentRound === 'general' ? parseInt(selectedTeamId) || null : null;
    const question = currentQuestions.find(q => q.id === questionId);
    if (question) {
      await updateQuizState('SET_CURRENT_QUESTION', { id: question.id, teamId, isPassed: false });
      setSelectedQuestionId('');
      setSelectedTeamId('');
      toast.success('Question selected!');
    }
  }, [selectedQuestionId, selectedTeamId, currentQuestions, state.currentRound, updateQuizState]);

  const handleTeamSelect = useCallback(async () => {
    const teamId = parseInt(selectedTeamId) || null;
    await updateQuizState('SET_CURRENT_TEAM', { teamId });
    toast.success(`Team ${state.teams.find(t => t.id === teamId)?.name || 'None'} selected!`);
  }, [selectedTeamId, updateQuizState, state.teams]);

  const handleScoreUpdate = useCallback(async (teamId: number, newScore: number) => {
    await updateQuizState('UPDATE_TEAM_SCORE', { teamId, score: newScore });
    toast.success(`Score updated for ${state.teams.find(t => t.id === teamId)?.name}`);
  }, [updateQuizState, state.teams]);

  const handleTeamNameUpdate = useCallback(async (teamId: number, newName: string) => {
    if (newName.trim() === '') {
      toast.error('Team name cannot be empty');
      return;
    }
    try {
      await updateQuizState('UPDATE_TEAM_NAME', { teamId, name: newName });
      setTeamNames(prev => ({ ...prev, [teamId]: newName }));
      toast.success(`Team name updated to ${newName}`);
    } catch (error) {
      toast.error('Failed to update team name');
    }
  }, [updateQuizState]);

  const resetQuiz = useCallback(async () => {
    const confirmed = window.confirm('Are you sure you want to reset the entire quiz? This will clear all scores and mark all questions as unused.');
    if (confirmed) {
      setIsResetting(true);
      try {
        await updateQuizState('RESET_QUIZ', null);
        await refreshState();
        toast.success('Quiz reset successfully!');
      } catch (error) {
        console.error('Error resetting quiz:', error);
        toast.error('Failed to reset quiz');
      } finally {
        setIsResetting(false);
      }
    }
  }, [updateQuizState, refreshState]);

  const syncQuestions = useCallback(async () => {
    setIsSyncing(true);
    try {
      await fetch('http://localhost:3001/api/sync-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: state.version })
      });
      await refreshState();
      toast.success('Questions synced successfully from JSON files!');
    } catch (error) {
      console.error('Error syncing questions:', error);
      toast.error('Failed to sync questions');
    } finally {
      setIsSyncing(false);
    }
  }, [refreshState, state.version]);

  const clearAndReinitialize = useCallback(async () => {
    const confirmed = window.confirm('Are you sure you want to clear all team names, questions, and quiz state, and reinitialize the database? This action cannot be undone.');
    if (confirmed) {
      setIsClearing(true);
      try {
        const response = await fetch('http://localhost:3001/api/clear-and-reinitialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
          throw new Error('Failed to clear and reinitialize database');
        }
        await refreshState();
        setTeamNames(state.teams.reduce((acc, team) => ({ ...acc, [team.id]: team.name }), {}));
        toast.success('Database cleared and reinitialized successfully!');
      } catch (error) {
        console.error('Error clearing and reinitializing database:', error);
        toast.error('Failed to clear and reinitialize database');
      } finally {
        setIsClearing(false);
      }
    }
  }, [refreshState, state.teams]);

  const startTimer = useCallback(async () => {
    const seconds = state.currentRound === 'rapid-fire' ? 60 : state.isPassed ? 15 : 30;
    await updateQuizState('START_TIMER', { seconds });
    toast.success('Timer started!');
  }, [updateQuizState, state.currentRound, state.isPassed]);

  const stopTimer = useCallback(async () => {
    await updateQuizState('STOP_TIMER', null);
    toast.success('Timer stopped!');
  }, [updateQuizState]);

  const resetTimer = useCallback(async () => {
    await updateQuizState('RESET_TIMER', null);
    toast.success('Timer reset!');
  }, [updateQuizState]);

  const passQuestion = useCallback(async () => {
    await updateQuizState('PASS_QUESTION', null);
    toast.success('Question passed! Timer set to 15 seconds.');
  }, [updateQuizState]);

  const stats = getRoundStats(state);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-blue-400">Quiz Master Control</h1>
          <div className="flex gap-3">
            <button
              onClick={syncQuestions}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg transition-colors"
            >
              <Database size={20} />
              {isSyncing ? 'Syncing...' : 'Sync Questions'}
            </button>
            <button
              onClick={resetQuiz}
              disabled={isResetting}
              className="flex items-center gap-2 px-4 py-2

 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg transition-colors"
            >
              <RotateCcw size={20} />
              {isResetting ? 'Resetting...' : 'Reset Quiz'}
            </button>
            <button
              onClick={clearAndReinitialize}
              disabled={isClearing}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 rounded-lg transition-colors"
            >
              <Trash2 size={20} />
              {isClearing ? 'Clearing...' : 'Clear & Reinitialize'}
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">General Round</h3>
            <p className="text-2xl font-bold">{stats.generalUsed}/{stats.generalTotal} Questions Used</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-purple-400 mb-2">AV Round</h3>
            <p className="text-2xl font-bold">{stats.avUsed}/{stats.avTotal} Questions Used</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">Extra Round</h3>
            <p className="text-2xl font-bold">{stats.extraUsed}/{stats.extraTotal} Questions Used</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Question Control */}
          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold mb-4 text-green-400">Question Control</h2>
            
            {/* Round Switch */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Round</label>
              <select
                value={state.currentRound}
                onChange={(e) => updateQuizState('SET_ROUND', e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General Round ({stats.generalTotal} questions)</option>
                <option value="av">Audio-Visual Round ({stats.avTotal} questions)</option>
                <option value="extra">Extra Round ({stats.extraTotal} questions)</option>
                <option value="rapid-fire">Rapid-Fire Round</option>
              </select>
            </div>

            {/* Team Selection */}
            {(state.currentRound === 'general' || state.currentRound === 'rapid-fire') && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  {state.currentRound === 'general' ? 'Current Team Turn' : 'Rapid-Fire Team'}
                </label>
                <div className="flex gap-3">
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a team...</option>
                    {state.teams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleTeamSelect}
                    disabled={!selectedTeamId}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    Set Team
                  </button>
                </div>
                {state.currentTeamId && (
                  <p className="mt-2 text-sm text-gray-300">
                    Current Team: {state.teams.find(t => t.id === state.currentTeamId)?.name}
                  </p>
                )}
              </div>
            )}

            {/* Question Selection */}
            {state.currentRound !== 'rapid-fire' && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Available Questions ({availableQuestions.length} remaining)
                </label>
                <div className="flex gap-3">
                  <select
                    value={selectedQuestionId}
                    onChange={(e) => setSelectedQuestionId(e.target.value)}
                    className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a question number...</option>
                    {availableQuestions.map(q => (
                      <option key={q.id} value={q.id}>
                        Question {q.id}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleQuestionSelect}
                    disabled={!selectedQuestionId || (state.currentRound === 'general' && !selectedTeamId)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Play size={20} />
                    Show
                  </button>
                </div>
              </div>
            )}

            {/* Timer Controls */}
            {(state.currentQuestion || state.currentRound === 'rapid-fire') && (
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-300 mb-2">
                  Timer: {state.timerSeconds} seconds {state.isPassed ? '(Passed)' : ''}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={startTimer}
                    disabled={state.isTimerRunning}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Play size={18} />
                    Start
                  </button>
                  <button
                    onClick={stopTimer}
                    disabled={!state.isTimerRunning}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Pause size={18} />
                    Stop
                  </button>
                  <button
                    onClick={resetTimer}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <RotateCw size={18} />
                    Reset
                  </button>
                  {state.currentRound !== 'rapid-fire' && state.currentQuestion && (
                    <button
                      onClick={passQuestion}
                      disabled={state.isPassed}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <FastForward size={18} />
                      Pass
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Current Question Display */}
            {state.currentQuestion && state.currentRound !== 'rapid-fire' && (
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-300 mb-2">
                  Current Question #{state.currentQuestion.id} {state.isPassed ? '(Passed)' : ''}
                  {state.currentRound === 'general' && state.currentTeamId
                    ? ` - Team: ${state.teams.find(t => t.id === state.currentTeamId)?.name}`
                    : ''}
                </p>
                <p className="text-lg mb-4">{state.currentQuestion.question}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateQuizState('SHOW_QUESTION', !state.showQuestion)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Eye size={18} />
                    {state.showQuestion ? 'Hide Question' : 'Show Question'}
                  </button>
                  <button
                    onClick={() => updateQuizState('SHOW_ANSWER', !state.showAnswer)}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Eye size={18} />
                    {state.showAnswer ? 'Hide Answer' : 'Reveal Answer'}
                  </button>
                  <button
                    onClick={() => updateQuizState('SHOW_CONGRATULATIONS', !state.showCongratulations)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Trophy size={18} />
                    {state.showCongratulations ? 'Hide Congrats' : 'Show Congratulations'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Score Management */}
          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold mb-4 text-green-400">Score Management</h2>
            <div className="space-y-4">
              {state.teams.map(team => (
                <div key={team.id} className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
                  <div className={`w-4 h-4 rounded-full ${team.color}`}></div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={teamNames[team.id] || team.name}
                      onChange={(e) => setTeamNames(prev => ({ ...prev, [team.id]: e.target.value }))}
                      onBlur={() => handleTeamNameUpdate(team.id, teamNames[team.id] || team.name)}
                      className="w-full p-2 bg-gray-600 border border-gray-500 rounded focus:ring-2 focus:ring-blue-500 text-white"
                      placeholder="Team name"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={team.score}
                      onChange={(e) => handleScoreUpdate(team.id, parseInt(e.target.value) || 0)}
                      className="w-20 p-2 bg-gray-600 border border-gray-500 rounded focus:ring-2 focus:ring-blue-500 text-center text-white"
                    />
                    <span className="text-gray-300">pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Question Grid */}
        {state.currentRound !== 'rapid-fire' && (
          <div className="mt-8 bg-gray-800 p-6 rounded-xl">
            <h2 className="text-2xl font-semibold mb-4 text-green-400">
              {state.currentRound === 'general' ? 'General' : state.currentRound === 'av' ? 'Audio-Visual' : 'Extra'} Questions Status
            </h2>
            <div className="grid grid-cols-8 gap-2">
              {currentQuestions.map(question => (
                <div
                  key={question.id}
                  className={`p-3 rounded-lg text-center font-semibold ${
                    question.id === state.currentQuestion?.id
                      ? 'bg-blue-600 text-white'
                      : question.used 
                      ? 'bg-red-600 text-white' 
                      : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                  }`}
                  onClick={() => {
                    if (!question.used) {
                      setSelectedQuestionId(question.id.toString());
                    }
                  }}
                >
                  {question.id}
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span>Used</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span>Selected</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;