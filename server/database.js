import { createPool } from 'mysql2/promise';
import { config } from 'dotenv';

config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'quiz',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = createPool(dbConfig);

async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create teams table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS teams (
        id INT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        score INT DEFAULT 0,
        color VARCHAR(50) NOT NULL
      )
    `);

    // Create questions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        round_type VARCHAR(50) NOT NULL,
        media_type VARCHAR(50),
        media_src TEXT,
        used BOOLEAN DEFAULT FALSE
      )
    `);

    // Create quiz_state table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS quiz_state (
        id INT PRIMARY KEY DEFAULT 1,
        current_round VARCHAR(50) DEFAULT 'general',
        current_question_id INT,
        show_answer BOOLEAN DEFAULT FALSE,
        show_congratulations BOOLEAN DEFAULT FALSE,
        show_question BOOLEAN DEFAULT FALSE,
        version INT DEFAULT 0
      )
    `);

    // Insert default teams if not exists
    const [teams] = await connection.execute('SELECT COUNT(*) as count FROM teams');
    if (teams[0].count === 0) {
      const defaultTeams = [
        { id: 1, name: 'Team Alpha', score: 0, color: 'bg-red-500' },
        { id: 2, name: 'Team Beta', score: 0, color: 'bg-blue-500' },
        { id: 3, name: 'Team Gamma', score: 0, color: 'bg-green-500' },
        { id: 4, name: 'Team Delta', score: 0, color: 'bg-yellow-500' },
        { id: 5, name: 'Team Epsilon', score: 0, color: 'bg-purple-500' },
      ];

      for (const team of defaultTeams) {
        await connection.execute(
          'INSERT INTO teams (id, name, score, color) VALUES (?, ?, ?, ?)',
          [team.id, team.name, team.score, team.color]
        );
      }
    }

    // Insert default quiz state if not exists
    const [state] = await connection.execute('SELECT COUNT(*) as count FROM quiz_state');
    if (state[0].count === 0) {
      await connection.execute(
        'INSERT INTO quiz_state (id, current_round, show_answer, show_congratulations, show_question, version) VALUES (1, "general", FALSE, FALSE, FALSE, 0)'
      );
    }

    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

export { pool, initializeDatabase };