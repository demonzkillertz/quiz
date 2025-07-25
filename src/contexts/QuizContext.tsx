import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

interface Team {
  id: number;
  name: string;
  score: number;
  color: string;
}

interface Question {
  id: number;
  question: string;
  answer: string;
  used: boolean;
  media?: { type: string; src: string };
}

interface QuizState {
  currentRound: string;
  currentQuestion: Question | null;
  currentTeamId: number | null;
  timerSeconds: number;
  isTimerRunning: boolean;
  isPassed: boolean;
  showAnswer: boolean;
  showCongratulations: boolean;
  showQuestion: boolean;
  showQuestionText: boolean;
  teams: Team[];
  generalQuestions: Question[];
  audioQuestions: Question[];
  imageQuestions: Question[];
  videoQuestions: Question[];
  extraQuestions: Question[];
  version: number;
}

type Action =
  | { type: 'LOAD_STATE'; payload: QuizState }
  | { type: 'UPDATE_STATE'; payload: Partial<QuizState> };

const initialState: QuizState = {
  currentRound: 'general',
  currentQuestion: null,
  currentTeamId: null,
  timerSeconds: 0,
  isTimerRunning: false,
  isPassed: false,
  showAnswer: false,
  showCongratulations: false,
  showQuestion: false,
  showQuestionText: false,
  teams: [],
  generalQuestions: [],
  audioQuestions: [],
  imageQuestions: [],
  videoQuestions: [],
  extraQuestions: [],
  version: 0
};

const QuizContext = createContext<{
  state: QuizState;
  updateQuizState: (type: string, payload: any) => Promise<void>;
  refreshState: () => Promise<void>;
}>({
  state: initialState,
  updateQuizState: async () => {},
  refreshState: async () => {}
});

const quizReducer = (state: QuizState, action: Action): QuizState => {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;
    case 'UPDATE_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  useEffect(() => {
    const socket = io('http://localhost:3001');

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
      refreshState();
    });

    socket.on('quiz-state-update', (data: QuizState) => {
      dispatch({ type: 'LOAD_STATE', payload: data });
    });

    socket.on('timer-end', () => {
      const audio = new Audio('/media/timer-end.mp3');
      audio.play().catch(error => console.error('Error playing timer end sound:', error));
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      toast.error('Failed to connect to server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const refreshState = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/quiz-state');
      if (!response.ok) {
        throw new Error('Failed to fetch quiz state');
      }
      const data: QuizState = await response.json();
      dispatch({ type: 'LOAD_STATE', payload: data });
    } catch (error) {
      console.error('Error refreshing state:', error);
      toast.error('Failed to refresh quiz state');
    }
  };

  const updateQuizState = async (type: string, payload: any) => {
    try {
      const response = await fetch('http://localhost:3001/api/quiz-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, payload })
      });
      if (!response.ok) {
        throw new Error('Failed to update quiz state');
      }
    } catch (error) {
      console.error('Error updating quiz state:', error);
      toast.error('Failed to update quiz state');
    }
  };

  return (
    <QuizContext.Provider value={{ state, updateQuizState, refreshState }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => useContext(QuizContext);