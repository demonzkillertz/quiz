import React from 'react';
import { useQuiz } from '../contexts/QuizContext';
import { Clock } from 'lucide-react';

const ProjectorView: React.FC = () => {
  const { state } = useQuiz();

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col">
      {/* Header with Scores */}
      <div className="flex justify-center gap-4 p-4 bg-gray-800 shadow-lg">
        {state.teams.map(team => (
          <div
            key={team.id}
            className={`flex items-center gap-2 p-3 rounded-lg ${team.color} text-white font-semibold animate-pulse-on-update`}
          >
            <span>{team.name}</span>
            <span className="text-xl">{team.score} pts</span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {state.currentRound === 'rapid-fire' ? (
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 text-blue-400">Rapid-Fire Round</h1>
            {state.currentTeamId && (
              <p className="text-3xl mb-4">
                Team: {state.teams.find(t => t.id === state.currentTeamId)?.name}
              </p>
            )}
            <div className="flex items-center gap-2 text-4xl font-semibold text-yellow-400">
              <Clock size={40} />
              <span>{state.timerSeconds} seconds</span>
            </div>
          </div>
        ) : !state.currentQuestion || !state.showQuestion ? (
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-8 text-blue-400">
              {state.currentRound === 'general' ? 'General Round' :
               state.currentRound === 'av' ? 'Audio-Visual Round' :
               'Extra Round'}
            </h1>
            <p className="text-2xl mb-8">Waiting for question...</p>
            <div className="grid grid-cols-8 gap-2 max-w-4xl mx-auto">
              {(state.currentRound === 'general' ? state.generalQuestions :
                state.currentRound === 'av' ? state.avQuestions :
                state.extraQuestions).map(question => (
                <div
                  key={question.id}
                  className={`p-4 rounded-lg text-center font-semibold ${
                    question.used ? 'bg-red-600' : 'bg-green-600'
                  } text-white`}
                >
                  {question.id}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-8 animate-scale-in">
            <div className="bg-gray-800 p-8 rounded-xl max-w-3xl w-full text-center">
              {state.currentRound === 'general' && state.currentTeamId && (
                <p className="text-2xl mb-4 text-yellow-400">
                  Team: {state.teams.find(t => t.id === state.currentTeamId)?.name}
                </p>
              )}
              {state.isPassed && (
                <p className="text-xl mb-4 text-orange-400">Passed Question</p>
              )}
              <h2 className="text-3xl font-bold mb-4">{state.currentQuestion.question}</h2>
              {state.currentQuestion.media && (
                <div className="mb-4">
                  {state.currentQuestion.media.type === 'image' ? (
                    <img
                      src={state.currentQuestion.media.src}
                      alt="Question Media"
                      className="max-w-full max-h-96 mx-auto rounded-lg"
                    />
                  ) : state.currentQuestion.media.type === 'audio' ? (
                    <audio controls className="mx-auto">
                      <source src={state.currentQuestion.media.src} />
                    </audio>
                  ) : state.currentQuestion.media.type === 'video' ? (
                    <video controls className="max-w-full max-h-96 mx-auto rounded-lg">
                      <source src={state.currentQuestion.media.src} />
                    </video>
                  ) : null}
                </div>
              )}
              {state.showAnswer && (
                <p className="text-2xl text-green-400 mt-4 animate-bounce">
                  Answer: {state.currentQuestion.answer}
                </p>
              )}
              {state.showCongratulations && (
                <p className="text-3xl text-yellow-400 mt-4 animate-bounce">
                  Congratulations!
                </p>
              )}
              <div className="flex items-center gap-2 text-2xl font-semibold text-yellow-400 mt-4">
                <Clock size={30} />
                <span>{state.timerSeconds} seconds</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectorView;