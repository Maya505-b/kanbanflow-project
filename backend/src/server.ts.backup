import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import Task from "./models/Task";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
});
// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Route de test
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/boards", (req, res) => {
  res.json([
    { id: 1, title: "Projet Principal", tasks: 5 },
    { id: 2, title: "Sprint Actuel", tasks: 3 },
  ]);
});

// Routes CRUD pour les tâches
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(400).json({ error: "Failed to create task" });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(400).json({ error: "Failed to update task" });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ id: req.params.id });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// WebSocket pour les mises à jour en temps réel
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-board", (boardId) => {
    socket.join(boardId);
    console.log(`User joined board: ${boardId}`);
  });

  socket.on("task-updated", (data) => {
    socket.to(data.boardId).emit("task-changed", data);
    console.log("Task updated:", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Connexion MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/kanbanflow";
const PORT = process.env.PORT || 5000;

// Export app for testing
export { app };

// Démarrer le serveur seulement si pas en mode test 
if (process.env.NODE_ENV !== 'test') {
 server.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);

   // Se connecter à MongoDB
   mongoose
     .connect(MONGODB_URI)
     .then(() => console.log("Connected to MongoDB"))
     .catch((error) => console.error("MongoDB connection error:", error));
  });
}

