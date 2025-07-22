export interface Question {
  id: number;
  question: string;
  answer: string;
  media?: {
    type: 'audio' | 'video' | 'image';
    src: string;
  };
  timeLimit?: number;
  used?: boolean;
}

export interface Team {
  id: number;
  name: string;
  score: number;
  color: string;
}

export interface QuizState {
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

export type QuizAction = 
  | { type: 'SET_ROUND'; payload: 'general' | 'av' | 'rapid-fire' }
  | { type: 'SET_CURRENT_QUESTION'; payload: Question | null }
  | { type: 'SHOW_ANSWER'; payload: boolean }
  | { type: 'SHOW_CONGRATULATIONS'; payload: boolean }
  | { type: 'UPDATE_TEAM_SCORE'; payload: { teamId: number; score: number } }
  | { type: 'MARK_QUESTION_USED'; payload: { round: 'general' | 'av' | 'rapid-fire'; questionId: number } }
  | { type: 'LOAD_STATE'; payload: QuizState }
  | { type: 'UPDATE_RAPID_FIRE_TIMER'; payload: number | null };