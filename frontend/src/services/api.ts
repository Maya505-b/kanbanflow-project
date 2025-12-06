const API_BASE_URL = 'http://localhost:5000/api';

export interface Task {
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

export const taskApi = {
  // Récupérer toutes les tâches
  async getAll(): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }
    return response.json();
  },

  // Créer une nouvelle tâche
  async create(task: Omit<Task, "_id" | "__v">): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error("Failed to create task");
    }
    return response.json();
  },

  // Mettre à jour une tâche
  async update(id: string, updates: Partial<Task>): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error("Failed to update task");
    }
    return response.json();
  },

  // Supprimer une tâche
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete task");
    }
  },
};
