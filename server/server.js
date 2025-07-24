import express from 'express';
import cors from 'cors';
import { pool, initializeDatabase } from './database.js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Fix path resolution for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Timer loop to decrement timer_seconds
let timerInterval = null;
async function startTimerLoop() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(async () => {
    let connection;
    try {
      connection = await pool.getConnection();
      const [state] = await connection.execute('SELECT is_timer_running, timer_seconds FROM quiz_state WHERE id = 1');
      if (state[0]?.is_timer_running && state[0]?.timer_seconds > 0) {
        await connection.execute('UPDATE quiz_state SET timer_seconds = timer_seconds - 1 WHERE id = 1');
        const [updatedState] = await connection.execute('SELECT * FROM quiz_state WHERE id = 1');
        const [teams] = await connection.execute('SELECT * FROM teams ORDER BY id');
        const [questions] = await connection.execute('SELECT * FROM questions ORDER BY id');

        let currentQuestion = null;
        if (updatedState[0]?.current_question_id) {
          const [questionResult] = await connection.execute(
            'SELECT * FROM questions WHERE id = ?',
            [updatedState[0].current_question_id]
          );
          if (questionResult.length > 0) {
            const q = questionResult[0];
            currentQuestion = {
              id: q.id,
              question: q.question,
              answer: q.answer,
              media: q.media_type ? { type: q.media_type, src: q.media_src } : undefined,
              used: q.used
            };
          }
        }

        const generalQuestions = questions
          .filter(q => q.round_type === 'general')
          .map(q => ({
            id: q.id,
            question: q.question,
            answer: q.answer,
            used: q.used
          }));

        const avQuestions = questions
          .filter(q => q.round_type === 'av')
          .map(q => ({
            id: q.id,
            question: q.question,
            answer: q.answer,
            media: q.media_type ? { type: q.media_type, src: q.media_src } : undefined,
            used: q.used
          }));

        const extraQuestions = questions
          .filter(q => q.round_type === 'extra')
          .map(q => ({
            id: q.id,
            question: q.question,
            answer: q.answer,
            media: q.media_type ? { type: q.media_type, src: q.media_src } : undefined,
            used: q.used
          }));

        const quizState = {
          currentRound: updatedState[0]?.current_round || 'general',
          currentQuestion,
          currentTeamId: updatedState[0]?.current_team_id || null,
          timerSeconds: updatedState[0]?.timer_seconds || 0,
          isTimerRunning: updatedState[0]?.is_timer_running || false,
          isPassed: updatedState[0]?.is_passed || false,
          showAnswer: updatedState[0]?.show_answer || false,
          showCongratulations: updatedState[0]?.show_congratulations || false,
          showQuestion: updatedState[0]?.show_question || false,
          teams,
          generalQuestions,
          avQuestions,
          extraQuestions,
          version: updatedState[0]?.version || 0
        };

        io.emit('quiz-state-update', quizState);
      } else if (state[0]?.timer_seconds <= 0) {
        await connection.execute('UPDATE quiz_state SET is_timer_running = FALSE WHERE id = 1');
        clearInterval(timerInterval);
        timerInterval = null;
      }
    } catch (error) {
      console.error('Error in timer loop:', error);
    } finally {
      if (connection) connection.release();
    }
  }, 1000);
}

// Initialize database on startup
initializeDatabase();

// Load questions from JSON files and sync with database
async function syncQuestionsFromJSON(version = null) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const generalQuestions = JSON.parse(
      await readFile(join(__dirname, '../src/data/generalQuestions.json'), 'utf8')
    );
    const avQuestions = JSON.parse(
      await readFile(join(__dirname, '../src/data/avQuestions.json'), 'utf8')
    );
    const extraQuestions = JSON.parse(
      await readFile(join(__dirname, '../src/data/extraQuestions.json'), 'utf8')
    );

    // Check version if provided
    if (version) {
      const [currentVersion] = await connection.execute('SELECT version FROM quiz_state WHERE id = 1');
      if (currentVersion[0].version >= version) {
        throw new Error('Version already up-to-date or newer');
      }
    }

    // Clear existing questions for each round type
    await connection.execute('DELETE FROM questions WHERE round_type = ?', ['general']);
    await connection.execute('DELETE FROM questions WHERE round_type = ?', ['av']);
    await connection.execute('DELETE FROM questions WHERE round_type = ?', ['extra']);

    // Insert general questions
    for (const q of generalQuestions) {
      await connection.execute(
        'INSERT INTO questions (id, question, answer, round_type, used) VALUES (?, ?, ?, ?, FALSE)',
        [q.id, q.question, q.answer, 'general']
      );
    }

    // Insert AV questions
    for (const q of avQuestions) {
      await connection.execute(
        'INSERT INTO questions (id, question, answer, round_type, media_type, media_src, used) VALUES (?, ?, ?, ?, ?, ?, FALSE)',
        [q.id, q.question, q.answer, 'av', q.media?.type || null, q.media?.src || null]
      );
    }

    // Insert extra questions
    for (const q of extraQuestions) {
      await connection.execute(
        'INSERT INTO questions (id, question, answer, round_type, media_type, media_src, used) VALUES (?, ?, ?, ?, ?, ?, FALSE)',
        [q.id, q.question, q.answer, 'extra', q.media?.type || null, q.media?.src || null]
      );
    }

    // Update version in quiz_state
    await connection.execute('UPDATE quiz_state SET version = version + 1 WHERE id = 1');

    await connection.commit();
    console.log('Questions synced from JSON files');
    return { success: true, message: 'Questions synced successfully' };
  } catch (error) {
    await connection.rollback();
    console.error('Error syncing questions:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// API Routes

// Get all quiz data
app.get('/api/quiz-state', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const [teams] = await connection.execute('SELECT * FROM teams ORDER BY id');
    const [questions] = await connection.execute('SELECT * FROM questions ORDER BY id');
    const [state] = await connection.execute('SELECT * FROM quiz_state WHERE id = 1');
    
    let currentQuestion = null;
    if (state[0]?.current_question_id) {
      const [questionResult] = await connection.execute(
        'SELECT * FROM questions WHERE id = ?',
        [state[0].current_question_id]
      );
      if (questionResult.length > 0) {
        const q = questionResult[0];
        currentQuestion = {
          id: q.id,
          question: q.question,
          answer: q.answer,
          media: q.media_type ? { type: q.media_type, src: q.media_src } : undefined,
          used: q.used
        };
      }
    }

    const generalQuestions = questions
      .filter(q => q.round_type === 'general')
      .map(q => ({
        id: q.id,
        question: q.question,
        answer: q.answer,
        used: q.used
      }));

    const avQuestions = questions
      .filter(q => q.round_type === 'av')
      .map(q => ({
        id: q.id,
        question: q.question,
        answer: q.answer,
        media: q.media_type ? { type: q.media_type, src: q.media_src } : undefined,
        used: q.used
      }));

    const extraQuestions = questions
      .filter(q => q.round_type === 'extra')
      .map(q => ({
        id: q.id,
        question: q.question,
        answer: q.answer,
        media: q.media_type ? { type: q.media_type, src: q.media_src } : undefined,
        used: q.used
      }));

    const quizState = {
      currentRound: state[0]?.current_round || 'general',
      currentQuestion,
      currentTeamId: state[0]?.current_team_id || null,
      timerSeconds: state[0]?.timer_seconds || 0,
      isTimerRunning: state[0]?.is_timer_running || false,
      isPassed: state[0]?.is_passed || false,
      showAnswer: state[0]?.show_answer || false,
      showCongratulations: state[0]?.show_congratulations || false,
      showQuestion: state[0]?.show_question || false,
      teams,
      generalQuestions,
      avQuestions,
      extraQuestions,
      version: state[0]?.version || 0
    };

    res.json(quizState);
  } catch (error) {
    console.error('Error fetching quiz state:', error);
    res.status(500).json({ error: 'Failed to fetch quiz state', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Update quiz state
app.post('/api/quiz-state', async (req, res) => {
  let connection;
  try {
    const { type, payload } = req.body;
    if (!type) throw new Error('Action type is required');
    
    connection = await pool.getConnection();
    await connection.beginTransaction();

    switch (type) {
      case 'SET_ROUND':
        if (!['general', 'av', 'rapid-fire', 'extra'].includes(payload)) {
          throw new Error('Invalid round type');
        }
        await connection.execute(
          'UPDATE quiz_state SET current_round = ?, current_question_id = NULL, current_team_id = NULL, timer_seconds = 0, is_timer_running = FALSE, is_passed = FALSE, show_answer = FALSE, show_congratulations = FALSE, show_question = FALSE WHERE id = 1',
          [payload]
        );
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
        break;

      case 'SET_CURRENT_QUESTION':
        await connection.execute(
          'UPDATE quiz_state SET current_question_id = ?, current_team_id = ?, timer_seconds = ?, is_timer_running = FALSE, is_passed = FALSE, show_answer = FALSE, show_congratulations = FALSE, show_question = TRUE WHERE id = 1',
          [payload?.id || null, payload?.teamId || null, payload?.isPassed ? 15 : 30]
        );
        if (payload?.id) {
          await connection.execute(
            'UPDATE questions SET used = TRUE WHERE id = ?',
            [payload.id]
          );
        }
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
        break;

      case 'SET_CURRENT_TEAM':
        await connection.execute(
          'UPDATE quiz_state SET current_team_id = ? WHERE id = 1',
          [payload?.teamId || null]
        );
        break;

      case 'START_TIMER':
        await connection.execute(
          'UPDATE quiz_state SET is_timer_running = TRUE, timer_seconds = ? WHERE id = 1',
          [payload?.seconds || (state[0]?.current_round === 'rapid-fire' ? 60 : state[0]?.is_passed ? 15 : 30)]
        );
        startTimerLoop();
        break;

      case 'STOP_TIMER':
        await connection.execute(
          'UPDATE quiz_state SET is_timer_running = FALSE WHERE id = 1'
        );
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
        break;

      case 'RESET_TIMER':
        await connection.execute(
          'UPDATE quiz_state SET timer_seconds = ?, is_timer_running = FALSE WHERE id = 1',
          [state[0]?.current_round === 'rapid-fire' ? 60 : state[0]?.is_passed ? 15 : 30]
        );
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
        break;

      case 'PASS_QUESTION':
        await connection.execute(
          'UPDATE quiz_state SET is_passed = TRUE, timer_seconds = 15, is_timer_running = FALSE WHERE id = 1'
        );
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
        break;

      case 'SHOW_ANSWER':
        await connection.execute(
          'UPDATE quiz_state SET show_answer = ? WHERE id = 1',
          [payload]
        );
        break;

      case 'SHOW_CONGRATULATIONS':
        await connection.execute(
          'UPDATE quiz_state SET show_congratulations = ? WHERE id = 1',
          [payload]
        );
        break;

      case 'SHOW_QUESTION':
        await connection.execute(
          'UPDATE quiz_state SET show_question = ? WHERE id = 1',
          [payload]
        );
        break;

      case 'UPDATE_TEAM_SCORE':
        await connection.execute(
          'UPDATE teams SET score = ? WHERE id = ?',
          [payload.score, payload.teamId]
        );
        break;

      case 'UPDATE_TEAM_NAME':
        await connection.execute(
          'UPDATE teams SET name = ? WHERE id = ?',
          [payload.name, payload.teamId]
        );
        break;

      case 'RESET_QUIZ':
        await connection.execute('UPDATE teams SET score = 0');
        await connection.execute('UPDATE questions SET used = FALSE');
        await connection.execute(
          'UPDATE quiz_state SET current_round = "general", current_question_id = NULL, current_team_id = NULL, timer_seconds = 0, is_timer_running = FALSE, is_passed = FALSE, show_answer = FALSE, show_congratulations = FALSE, show_question = FALSE WHERE id = 1'
        );
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
        break;

      default:
        throw new Error(`Unknown action type: ${type}`);
    }

    await connection.commit();

    // Fetch updated state
    const [state] = await connection.execute('SELECT * FROM quiz_state WHERE id = 1');
    const [teams] = await connection.execute('SELECT * FROM teams ORDER BY id');
    const [questions] = await connection.execute('SELECT * FROM questions ORDER BY id');

    let currentQuestion = null;
    if (state[0]?.current_question_id) {
      const [questionResult] = await connection.execute(
        'SELECT * FROM questions WHERE id = ?',
        [state[0].current_question_id]
      );
      if (questionResult.length > 0) {
        const q = questionResult[0];
        currentQuestion = {
          id: q.id,
          question: q.question,
          answer: q.answer,
          media: q.media_type ? { type: q.media_type, src: q.media_src } : undefined,
          used: q.used
        };
      }
    }

    const generalQuestions = questions
      .filter(q => q.round_type === 'general')
      .map(q => ({
        id: q.id,
        question: q.question,
        answer: q.answer,
        used: q.used
      }));

    const avQuestions = questions
      .filter(q => q.round_type === 'av')
      .map(q => ({
        id: q.id,
        question: q.question,
        answer: q.answer,
        media: q.media_type ? { type: q.media_type, src: q.media_src } : undefined,
        used: q.used
      }));

    const extraQuestions = questions
      .filter(q => q.round_type === 'extra')
      .map(q => ({
        id: q.id,
        question: q.question,
        answer: q.answer,
        media: q.media_type ? { type: q.media_type, src: q.media_src } : undefined,
        used: q.used
      }));

    const quizState = {
      currentRound: state[0]?.current_round || 'general',
      currentQuestion,
      currentTeamId: state[0]?.current_team_id || null,
      timerSeconds: state[0]?.timer_seconds || 0,
      isTimerRunning: state[0]?.is_timer_running || false,
      isPassed: state[0]?.is_passed || false,
      showAnswer: state[0]?.show_answer || false,
      showCongratulations: state[0]?.show_congratulations || false,
      showQuestion: state[0]?.show_question || false,
      teams,
      generalQuestions,
      avQuestions,
      extraQuestions,
      version: state[0]?.version || 0
    };

    // Broadcast updated state
    io.emit('quiz-state-update', quizState);

    res.json({ success: true });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error updating quiz state:', error);
    res.status(500).json({ error: 'Failed to update quiz state', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Resync questions from JSON
app.post('/api/sync-questions', async (req, res) => {
  let connection;
  try {
    const { version } = req.body;
    const result = await syncQuestionsFromJSON(version);
    
    // Fetch updated state after syncing
    connection = await pool.getConnection();
    const [state] = await connection.execute('SELECT * FROM quiz_state WHERE id = 1');
    const [teams] = await connection.execute('SELECT * FROM teams ORDER BY id');
    const [questions] = await connection.execute('SELECT * FROM questions ORDER BY id');

    let currentQuestion = null;
    if (state[0]?.current_question_id) {
      const [questionResult] = await connection.execute(
        'SELECT * FROM questions WHERE id = ?',
        [state[0].current_question_id]
      );
      if (questionResult.length > 0) {
        const q = questionResult[0];
        currentQuestion = {
          id: q.id,
          question: q.question,
          answer: q.answer,
          media: q.media_type ? { type: q.media_type, src: q.media_src } : undefined,
          used: q.used
        };
      }
    }

    const generalQuestions = questions
      .filter(q => q.round_type === 'general')
      .map(q => ({
        id: q.id,
        question: q.question,
        answer: q.answer,
        used: q.used
      }));

    const avQuestions = questions
      .filter(q => q.round_type === 'av')
      .map(q => ({
        id: q.id,
        question: q.question,
        answer: q.answer,
        media: q.media_type ? { type: q.media_type, src: q.media_src } : undefined,
        used: q.used
      }));

    const extraQuestions = questions
      .filter(q => q.round_type === 'extra')
      .map(q => ({
        id: q.id,
        question: q.question,
        answer: q.answer,
        media: q.media_type ? { type: q.media_type, src: q.media_src } : undefined,
        used: q.used
      }));

    const quizState = {
      currentRound: state[0]?.current_round || 'general',
      currentQuestion,
      currentTeamId: state[0]?.current_team_id || null,
      timerSeconds: state[0]?.timer_seconds || 0,
      isTimerRunning: state[0]?.is_timer_running || false,
      isPassed: state[0]?.is_passed || false,
      showAnswer: state[0]?.show_answer || false,
      showCongratulations: state[0]?.show_congratulations || false,
      showQuestion: state[0]?.show_question || false,
      teams,
      generalQuestions,
      avQuestions,
      extraQuestions,
      version: state[0]?.version || 0
    };

    io.emit('quiz-state-update', quizState);

    res.json(result);
  } catch (error) {
    console.error('Error syncing questions:', error);
    res.status(500).json({ error: 'Failed to sync questions', details: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// Clear and reinitialize database
app.post('/api/clear-and-reinitialize', async (req, res) => {
  let connection;
  try {
    console.log('Starting clear and reinitialize');
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Clear all tables
    console.log('Clearing tables');
    await connection.execute('DELETE FROM teams');
    await connection.execute('DELETE FROM questions');
    await connection.execute('DELETE FROM quiz_state');

    // Drop and recreate tables to ensure clean state
    console.log('Dropping and recreating tables');
    await connection.execute('DROP TABLE IF EXISTS teams');
    await connection.execute('DROP TABLE IF EXISTS questions');
    await connection.execute('DROP TABLE IF EXISTS quiz_state');

    // Reinitialize database within transaction
    console.log('Calling initializeDatabase');
    await initializeDatabase();

    // Ensure quiz_state has default data
    console.log('Ensuring quiz_state default data');
    const [stateCheck] = await connection.execute('SELECT COUNT(*) as count FROM quiz_state');
    if (stateCheck[0].count === 0) {
      console.log('Inserting default quiz_state');
      await connection.execute(
        'INSERT INTO quiz_state (id, current_round, current_question_id, current_team_id, timer_seconds, is_timer_running, is_passed, show_answer, show_congratulations, show_question, version) VALUES (1, "general", NULL, NULL, 0, FALSE, FALSE, FALSE, FALSE, FALSE, 0)'
      );
    }

    // Fetch updated state
    console.log('Fetching updated state');
    const [state] = await connection.execute('SELECT * FROM quiz_state WHERE id = 1');
    const [teams] = await connection.execute('SELECT * FROM teams ORDER BY id');
    const [questions] = await connection.execute('SELECT * FROM questions ORDER BY id');

    const quizState = {
      currentRound: state[0]?.current_round || 'general',
      currentQuestion: null,
      currentTeamId: state[0]?.current_team_id || null,
      timerSeconds: state[0]?.timer_seconds || 0,
      isTimerRunning: state[0]?.is_timer_running || false,
      isPassed: state[0]?.is_passed || false,
      showAnswer: state[0]?.show_answer || false,
      showCongratulations: state[0]?.show_congratulations || false,
      showQuestion: state[0]?.show_question || false,
      teams,
      generalQuestions: [],
      avQuestions: [],
      extraQuestions: [],
      version: state[0]?.version || 0
    };

    console.log('Broadcasting updated state:', quizState);
    io.emit('quiz-state-update', quizState);

    await connection.commit();
    console.log('Database cleared and reinitialized successfully');
    res.json({ success: true, message: 'Database cleared and reinitialized successfully' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error clearing and reinitializing database:', error);
    res.status(500).json({ error: 'Failed to clear and reinitialize database', details: error.message });
  } finally {
    if (connection) {
      console.log('Releasing connection');
      connection.release();
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});