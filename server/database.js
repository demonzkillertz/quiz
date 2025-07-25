import { createPool } from 'mysql2/promise';
import { config } from 'dotenv';
import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Initializing database');

    // Check if configuration has changed
    const configFilePath = join(__dirname, 'dbConfig.json');
    let previousConfig = {};
    try {
      previousConfig = JSON.parse(await readFile(configFilePath, 'utf8'));
    } catch (error) {
      console.log('No previous config found, proceeding with initialization');
    }

    const currentConfig = {
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database
    };

    const configChanged = JSON.stringify(currentConfig) !== JSON.stringify(previousConfig);

    // Check if tables exist
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'quiz_state'"
    );
    const tablesExist = tables.length > 0;

    if (!configChanged && tablesExist) {
      console.log('Database configuration unchanged and tables exist, skipping initialization');
      return;
    }

    // Drop tables to ensure clean state
    console.log('Dropping existing tables');
    await connection.execute('DROP TABLE IF EXISTS teams');
    await connection.execute('DROP TABLE IF EXISTS questions');
    await connection.execute('DROP TABLE IF EXISTS quiz_state');

    // Create teams table
    console.log('Creating teams table');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS teams (
        id INT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        score INT DEFAULT 0,
        color VARCHAR(50) NOT NULL
      )
    `);

    // Create questions table
    console.log('Creating questions table');
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

    // Create quiz_state table with new column
    console.log('Creating quiz_state table');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS quiz_state (
        id INT PRIMARY KEY DEFAULT 1,
        current_round VARCHAR(50) DEFAULT 'general',
        current_question_id INT,
        current_team_id INT,
        timer_seconds INT DEFAULT 0,
        is_timer_running BOOLEAN DEFAULT FALSE,
        is_passed BOOLEAN DEFAULT FALSE,
        show_answer BOOLEAN DEFAULT FALSE,
        show_congratulations BOOLEAN DEFAULT FALSE,
        show_question BOOLEAN DEFAULT FALSE,
        show_question_text BOOLEAN DEFAULT FALSE,
        version INT DEFAULT 0
      )
    `);

    // Insert default teams if not exists
    console.log('Checking and inserting default teams');
    const [teams] = await connection.execute('SELECT COUNT(*) as count FROM teams');
    if (teams[0].count === 0) {
      const defaultTeams = [
        { id: 1, name: 'Group A', score: 0, color: 'bg-red-500' },
        { id: 2, name: 'Group B', score: 0, color: 'bg-blue-500' },
        { id: 3, name: 'Group C', score: 0, color: 'bg-green-500' },
        { id: 4, name: 'Group D', score: 0, color: 'bg-yellow-500' },
        { id: 5, name: 'Group E', score: 0, color: 'bg-purple-500' },
      ];

      for (const team of defaultTeams) {
        await connection.execute(
          'INSERT INTO teams (id, name, score, color) VALUES (?, ?, ?, ?)',
          [team.id, team.name, team.score, team.color]
        );
      }
      console.log('Default teams inserted');
    }

    // Insert default quiz state if not exists
    console.log('Checking and inserting default quiz_state');
    const [state] = await connection.execute('SELECT COUNT(*) as count FROM quiz_state');
    if (state[0].count === 0) {
      await connection.execute(
        'INSERT INTO quiz_state (id, current_round, current_question_id, current_team_id, timer_seconds, is_timer_running, is_passed, show_answer, show_congratulations, show_question, show_question_text, version) VALUES (1, "general", NULL, NULL, 0, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 0)'
      );
      console.log('Default quiz_state inserted');
    }

    // Save current configuration
    await writeFile(configFilePath, JSON.stringify(currentConfig));
    console.log('Database configuration saved to dbConfig.json');

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    if (connection) {
      console.log('Releasing connection in initializeDatabase');
      connection.release();
    }
  }
}

export { pool, initializeDatabase };