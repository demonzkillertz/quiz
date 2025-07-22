import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

interface Question {
  id: number;
  question: string;
  answer: string;
  media?: { type: string; src: string };
  used: boolean;
}

interface Team {
  id: number;
  name: string;
  score: number;
  color: string;
}

interface QuizState {
  currentRound: 'general' | 'av' | 'rapid-fire';
  currentQuestion: Question | null;
  showAnswer: boolean;
  showCongratulations: boolean;
  showQuestion: boolean;
  teams: Team[];
  generalQuestions: Question[];
  avQuestions: Question[];
  version: number;
}

interface QuizContextType {
  state: QuizState;
  updateQuizState: (type: string, payload: any) => Promise<void>;
  refreshState: () => Promise<void>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

const initialState: QuizState = {
  currentRound: 'general',
  currentQuestion: null,
  showAnswer: false,
  showCongratulations: false,
  showQuestion: false,
  teams: [],
  generalQuestions: [],
  avQuestions: [],
  version: 0
};

type Action =
  | { type: 'LOAD_STATE'; payload: QuizState }
  | { type: 'UPDATE_STATE'; payload: Partial<QuizState> };

const reducer = (state: QuizState, action: Action): QuizState => {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    case 'UPDATE_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const socketRef = useRef<Socket | null>(null);

  const refreshState = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/quiz-state');
      const data = await response.json();
      dispatch({ type: 'LOAD_STATE', payload: data });
    } catch (error) {
      console.error('Error fetching quiz state:', error);
      toast.error('Failed to fetch quiz state');
    }
  }, []);

  const updateQuizState = useCallback(async (type: string, payload: any) => {
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
      throw error;
    }
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    socket.on('quiz-state-update', (data: QuizState) => {
      dispatch({ type: 'LOAD_STATE', payload: data });
    });

    refreshState();

    return () => {
      socket.disconnect();
    };
  }, [refreshState]);

  return (
    <QuizContext.Provider value={{ state, updateQuizState, refreshState }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};