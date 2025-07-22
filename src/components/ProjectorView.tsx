import React, { useEffect } from 'react';
import { useQuiz } from '../contexts/QuizContext';

const ProjectorView: React.FC = () => {
  const { state } = useQuiz();

  useEffect(() => {
    if (state.currentQuestion && state.showAnswer) {
      const questionElement = document.getElementById('current-question');
      if (questionElement) {
        questionElement.classList.add('animate-pulse-on-update');
        setTimeout(() => {
          questionElement.classList.remove('animate-pulse-on-update');
        }, 300);
      }
    }
  }, [state.currentQuestion, state.showAnswer]);

  const currentQuestions = state.currentRound === 'general'
    ? state.generalQuestions
    : state.currentRound === 'av'
    ? state.avQuestions
    : [];

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col overflow-hidden">
      {/* Team Scores Header */}
      <div className="flex justify-between items-center px-8 py-4 bg-gray-900/80 backdrop-blur-sm">
        {state.teams.map(team => (
          <div key={team.id} className="text-center">
            <div className={`w-6 h-6 rounded-full ${team.color} mx-auto mb-2 transform hover:scale-110 transition-transform`}></div>
            <h2 className="text-xl font-semibold text-gray-200">{team.name}</h2>
            <p className="text-3xl font-bold text-yellow-400 animate-pulse-on-update">{team.score} pts</p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-4">
        {/* Current Round */}
        <h2 className="text-4xl font-bold text-blue-400 mb-6">
          {state.currentRound === 'general' ? 'General Round' : state.currentRound === 'av' ? 'Audio-Visual Round' : 'Rapid-Fire Round'}
        </h2>

        {/* Modal for Selected Question */}
        {state.currentQuestion && state.currentRound !== 'rapid-fire' && state.showQuestion ? (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-scale-in">
            <div className="bg-gray-800 rounded-xl p-8 max-w-4xl w-full max-h-[80vh] overflow-auto shadow-2xl border border-blue-500">
              <div id="current-question" className="text-center">
                <p className="text-2xl text-gray-300 mb-4">Question #{state.currentQuestion.id}</p>
                <h1 className="text-5xl font-bold text-white mb-6">{state.currentQuestion.question}</h1>

                {/* Media for AV Round */}
                {state.currentRound === 'av' && state.currentQuestion.media && (
                  <div className="my-8">
                    {state.currentQuestion.media.type === 'image' && (
                      <img
                        src={state.currentQuestion.media.src}
                        alt="Question media"
                        className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
                      />
                    )}
                    {state.currentQuestion.media.type === 'audio' && (
                      <audio controls src={state.currentQuestion.media.src} className="mx-auto" />
                    )}
                    {state.currentQuestion.media.type === 'video' && (
                      <video controls className="max-w-full max-h-96 mx-auto rounded-lg shadow-md">
                        <source src={state.currentQuestion.media.src} />
                      </video>
                    )}
                  </div>
                )}

                {/* Answer */}
                {state.showAnswer && (
                  <p className="text-3xl text-green-400 animate-pulse-on-update mt-6">
                    Answer: {state.currentQuestion.answer}
                  </p>
                )}

                {/* Congratulations */}
                {state.showCongratulations && (
                  <p className="text-4xl text-yellow-400 mt-8 animate-bounce">
                    Congratulations!
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-6xl">
            {/* Default View: Question Grid and Message */}
            {state.currentRound !== 'rapid-fire' ? (
              <>
                <p className="text-2xl text-gray-300 text-center mb-8">
                  {state.currentQuestion ? 'Question hidden' : 'Waiting for question...'}
                </p>
                <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700">
                  <h3 className="text-2xl font-semibold text-green-400 mb-4">
                    {state.currentRound === 'general' ? 'General' : 'Audio-Visual'} Questions Status
                  </h3>
                  <div className="grid grid-cols-8 gap-3">
                    {currentQuestions.map(question => (
                      <div
                        key={question.id}
                        className={`p-4 rounded-lg text-center font-semibold text-lg transition-transform transform hover:scale-105 ${
                          question.id === state.currentQuestion?.id
                            ? 'bg-blue-600 text-white'
                            : question.used
                            ? 'bg-red-600 text-white'
                            : 'bg-green-600 text-white'
                        }`}
                      >
                        {question.id}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-6 mt-6 text-sm justify-center">
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
              </>
            ) : (
              <p className="text-3xl text-gray-200 text-center animate-pulse">
                Rapid-Fire Round (Manual)
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectorView;