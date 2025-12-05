import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/boards', (req, res) => {
  res.json([
    { id: 1, title: 'Projet Principal', tasks: 5 },
    { id: 2, title: 'Sprint Actuel', tasks: 3 }
  ]);
});

// WebSocket pour les mises à jour en temps réel
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-board', (boardId) => {
    socket.join(boardId);
    console.log(`User joined board: ${boardId}`);
  });
  
  socket.on('task-updated', (data) => {
    socket.to(data.boardId).emit('task-changed', data);
    console.log('Task updated:', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kanbanflow';
const PORT = process.env.PORT || 5000;

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Se connecter à MongoDB
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));
});
