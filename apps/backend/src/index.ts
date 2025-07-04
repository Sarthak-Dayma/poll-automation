<<<<<<< HEAD
// Importing required modules
import express from 'express';                        // Express framework for building the HTTP server
import http from 'http';                              // Node's HTTP module to create server
import { setupWebSocketServer } from './transcription/websocket/connection'; // Custom WebSocket setup logic
import settingsRouter from "./web/routes/settings";   // Router for settings-related HTTP endpoints
import dotenv from 'dotenv';                          // To load environment variables from .env file
import cors from 'cors';                              // Middleware to enable Cross-Origin Resource Sharing
import saveQuestionsRouter from "./web/routes/save_questions"; // Router to handle saving generated questions
=======
import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';

import { setupWebSocketServer } from './ws/ws-server';
import settingsRouter from './web/routes/settings';
import saveQuestionsRouter from './web/routes/save_questions';
import pollConfigRoutes from './web/routes/pollConfigRoutes';
import transcriptsRouter from './web/routes/transcripts';
import { connectDB } from './web/config/dbconnect';
>>>>>>> 9ee913167a2d6a89eff541e3f79d80bd6c0c6e3d

// Load environment variables from .env file
dotenv.config();
connectDB();

// Initialize the Express application
const app = express();
<<<<<<< HEAD

// Create an HTTP server instance using the Express app
const server = http.createServer(app);

// Apply middlewares
app.use(cors());               // Enable CORS to allow frontend to communicate with backend across domains
app.use(express.json());       // Middleware to parse incoming JSON requests

// Route definitions
app.use("/settings", settingsRouter);       // Mount settings-related routes at /settings
app.use("/questions", saveQuestionsRouter); // Mount question-saving routes at /questions

// Health check route
=======
const port = Number(process.env.BACKEND_HTTP_PORT || 3000);
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use('/settings', settingsRouter);
app.use('/questions', saveQuestionsRouter);
app.use('/api/poll', pollConfigRoutes);
app.use('/transcripts', transcriptsRouter);

>>>>>>> 9ee913167a2d6a89eff541e3f79d80bd6c0c6e3d
app.get('/', (_req, res) => {
  res.send('PollGen Backend is running.');  // Simple response to confirm the server is alive
});

// Initialize WebSocket server for real-time transcription handling
setupWebSocketServer(server);

<<<<<<< HEAD
// Define port and start the HTTP server
const PORT = process.env.PORT || 3000;      // Use environment port or default to 3000
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`); // Log the server URL
=======
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
>>>>>>> 9ee913167a2d6a89eff541e3f79d80bd6c0c6e3d
});
