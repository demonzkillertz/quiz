Quiz Master
Quiz Master is a web-based application designed for conducting live quizzes in a college setting. It supports multiple round types (General, Audio-Visual, and Rapid-Fire), real-time score updates, team name customization, and a projector view for audience display. The system uses a MySQL database to manage quiz state, questions, and teams, with WebSocket for real-time updates between the admin panel and projector view.
Features

Multiple Round Types:
General Round: 40 text-based questions loaded from generalQuestions.json.
Audio-Visual (AV) Round: 10 questions with media support (images/videos) from avQuestions.json.
Rapid-Fire Round: Manual round with no predefined questions, managed by the quiz master.


Admin Panel (http://localhost:5173):
Select rounds and questions via dropdown or grid.
Show/hide questions, reveal/hide answers, and display congratulations messages.
Update team names and scores with real-time feedback.
Sync questions from JSON files, reset quiz state, or clear and reinitialize the database.


Projector View (http://localhost:5173/presentation):
Displays team scores, current round, and question grid (40 for General, 10 for AV).
Shows a modal with the current question, media (for AV), answer, or congratulations when enabled.
No scrollbar for a clean presentation (h-screen overflow-hidden).


Real-Time Updates: Uses WebSocket (socket.io) to sync state between admin panel and projector view.
Database Management:
MySQL database with teams, questions, and quiz_state tables.
Supports show_question for toggling question visibility.
"Clear & Reinitialize" resets all data to default teams and empty state.


Toast Notifications: Feedback for actions like syncing questions, resetting quiz, or updating team names.
Responsive Design: Built with Tailwind CSS for a modern, animated UI.

Prerequisites

Node.js: Version 18 or higher.
MySQL: Version 8 or higher, with a database named quiz_app.
Git: For cloning the repository.

Installation

Clone the Repository:
git clone https://github.com/your-username/quiz-master.git
cd quiz-master


Install Dependencies:
npm install

This installs required packages: express, cors, mysql2, socket.io, dotenv, react-router-dom, react-hot-toast, socket.io-client, concurrently, tailwindcss, lucide-react.

Set Up Environment Variables:

Create a .env file in the server directory with:PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=quiz_app


Replace your_password with your MySQL root password (or leave blank if none).


Set Up MySQL Database:

Ensure MySQL is running and create the database:CREATE DATABASE quiz_app;
GRANT ALL PRIVILEGES ON quiz_app.* TO 'root'@'localhost';




Prepare JSON Files:

Ensure src/data/generalQuestions.json and src/data/avQuestions.json exist.
Example generalQuestions.json:[
  { "id": 1, "question": "What is the capital of France?", "answer": "Paris" },
  // ... 39 more questions
]


Example avQuestions.json:[
  { "id": 1, "question": "Identify this landmark.", "answer": "Eiffel Tower", "media": { "type": "image", "src": "/images/eiffel.jpg" } },
  // ... 9 more questions
]





Running the Application

Start the Development Server:
npm run dev:full

This runs both the backend (server.js on http://localhost:3001) and frontend (vite on http://localhost:5173) concurrently.

Access the Application:

Admin Panel: http://localhost:5173
Projector View: http://localhost:5173/presentation



Usage
Admin Panel (http://localhost:5173)

Header Buttons:
Sync Questions (Green, Database icon): Loads questions from generalQuestions.json (40) and avQuestions.json (10).
Reset Quiz (Red, RotateCcw icon): Resets team scores to 0, marks questions unused, and sets round to General.
Clear & Reinitialize (Orange, Trash2 icon): Clears all data and reinitializes with default teams (Alpha, Beta, Gamma, Delta, Epsilon) and empty state.


Round Selection: Choose General, AV, or Rapid-Fire via dropdown.
Question Selection: Select a question from the dropdown or grid (available questions are green, used are red, selected is blue).
Question Control: Toggle show/hide question, reveal/hide answer, or show/hide congratulations.
Score Management: Update team names and scores with real-time updates and toast notifications.

Projector View (http://localhost:5173/presentation)

Displays team scores and round title at the top.
Shows a question grid (40 for General, 10 for AV) or “Waiting for question...” when no question is selected.
When a question is shown (showQuestion: true), a modal displays the question, media (for AV), answer, or congratulations.
Rapid-Fire round shows “Rapid-Fire Round (Manual)” with no grid or modal.
Updates instantly via WebSocket for round changes, question selections, and team name/score updates.

Database Management

Tables:
teams: Stores team data (id, name, score, color).
questions: Stores questions (id, question, answer, round_type, media_type, media_src, used).
quiz_state: Stores state (id, current_round, current_question_id, show_answer, show_congratulations, show_question, version).


Initialization: On startup or “Clear & Reinitialize”, creates tables and inserts 5 default teams and a default quiz_state (General round, all flags FALSE).
Sync Questions: Populates questions table from JSON files.

File Structure
quiz-master/
├── server/
│   ├── server.js           # Backend server (Express, Socket.IO)
│   ├── database.js         # MySQL connection and initialization
│   └── .env                # Environment variables
├── src/
│   ├── components/
│   │   ├── AdminPanel.tsx  # Admin interface for quiz control
│   │   └── ProjectorView.tsx # Projector view for audience
│   ├── contexts/
│   │   └── QuizContext.tsx # React context for quiz state
│   ├── data/
│   │   ├── generalQuestions.json # General round questions
│   │   └── avQuestions.json      # AV round questions
│   ├── App.tsx             # Main app with routing
│   └── index.css           # Tailwind CSS with animations
├── package.json            # Project dependencies and scripts
└── tailwind.config.js      # Tailwind configuration

Development

Backend: Built with Express and Socket.IO, running on http://localhost:3001.
Frontend: Built with React, TypeScript, Vite, and Tailwind CSS, running on http://localhost:5173.
Database: MySQL with mysql2/promise for async queries.
Scripts:
npm run dev:full: Runs backend and frontend concurrently.
npm run dev: Runs frontend only (Vite).
npm run server: Runs backend only (Node.js).



Troubleshooting

Database Errors:
Verify MySQL is running and .env credentials are correct.
Check logs for Database initialized successfully.
Manually create the database:CREATE DATABASE quiz_app;




Connection Errors:
Ensure no ReferenceError: connection is not defined in server logs (fixed in server.js).
Check WebSocket connection (ws://localhost:3001) in QuizContext.tsx.


UI Issues:
Verify lucide-react is installed for icons.
Ensure index.css includes Tailwind directives and animations.


Sync Questions Fails:
Confirm generalQuestions.json and avQuestions.json exist in src/data.
Check JSON validity using a linter or cat src/data/generalQuestions.json.



Contributing

Fork the repository.
Create a feature branch (git checkout -b feature/YourFeature).
Commit changes (git commit -m 'Add YourFeature').
Push to the branch (git push origin feature/YourFeature).
Open a pull request.

License
MIT License. See LICENSE for details.