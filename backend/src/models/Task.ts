import mongoose from "mongoose";

export interface ITask extends mongoose.Document {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  labels: string[];
  assignee?: string;
  status: "todo" | "inprogress" | "review" | "done";
  createdAt: string;
}

const TaskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  priority: { 
    type: String, 
    enum: ["low", "medium", "high"], 
    default: "medium" 
  },
  dueDate: { type: String },
  labels: [{ type: String }],
  assignee: { type: String, default: "Non assigné" },
  status: { 
    type: String, 
    enum: ["todo", "inprogress", "review", "done"], 
    default: "todo" 
  },
  createdAt: { type: String, required: true }
});

export default mongoose.model<ITask>("Task", TaskSchema);
