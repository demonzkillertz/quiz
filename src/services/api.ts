const API_BASE_URL = 'http://localhost:3001/api';

interface QuizState {
  currentRound: 'general' | 'av' | 'rapid-fire';
  currentQuestion: Question | null;
  showAnswer: boolean;
  showCongratulations: boolean;
  teams: Team[];
  generalQuestions: Question[];
  avQuestions: Question[];
  rapidFireQuestions: Question[];
  version: number;
  rapidFireTimer: number | null;
}

interface Question {
  id: number;
  question: string;
  answer: string;
  media?: { type: 'audio' | 'video' | 'image'; src: string };
  timeLimit?: number;
  used?: boolean;
}

interface Team {
  id: number;
  name: string;
  score: number;
  color: string;
}

export const api = {
  async getQuizState(): Promise<QuizState> {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz-state`);
      if (!response.ok) throw new Error('Failed to fetch quiz state');
      return response.json();
    } catch (error) {
      console.error('API Error - getQuizState:', error);
      return {
        currentRound: 'general',
        currentQuestion: null,
        showAnswer: false,
        showCongratulations: false,
        teams: [
          { id: 1, name: 'Civil AB', score: 0, color: 'bg-red-500' },
          { id: 2, name: 'Civil CD', score: 0, color: 'bg-blue-500' },
          { id: 3, name: 'Computer', score: 0, color: 'bg-green-500' },
          { id: 4, name: 'Electronics', score: 0, color: 'bg-yellow-500' },
          { id: 5, name: 'Architecture', score: 0, color: 'bg-purple-500' },
        ],
        generalQuestions: [],
        avQuestions: [],
        rapidFireQuestions: [],
        version: 0,
        rapidFireTimer: null
      };
    }
  },

  async updateQuizState(type: string, payload: any): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz-state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, payload }),
      });
      if (!response.ok) throw new Error('Failed to update quiz state');
      return response.json();
    } catch (error) {
      console.error('API Error - updateQuizState:', error);
      throw error;
    }
  },

  async syncQuestions(version?: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/sync-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ version }),
      });
      if (!response.ok) throw new Error('Failed to sync questions');
      return response.json();
    } catch (error) {
      console.error('API Error - syncQuestions:', error);
      throw error;
    }
  },
};