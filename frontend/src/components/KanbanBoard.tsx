import React, { useState, useEffect,useRef } from 'react';
import { format } from 'date-fns';
import { taskApi } from '../services/api';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  labels: string[];
  assignee?: string;
  status: 'todo' | 'inprogress' | 'review' | 'done';
  createdAt: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>([
    { id: 'todo', title: 'À faire', tasks: [] },
    { id: 'inprogress', title: 'En cours', tasks: [] },
    { id: 'review', title: 'En revue', tasks: [] },
    { id: 'done', title: 'Terminé', tasks: [] },
  ]);
  
  const [darkMode, setDarkMode] = useState(() => {
    // Vérifier si le mode sombre était déjà activé
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium' as const,
    labels: [],
    status: 'todo'
  });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const initialLoad = useRef(true);

  // Sauvegarder le mode sombre dans localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

    useEffect(() => {
    const loadTasks = async () => {
      try {
        // Essayer de charger depuis l'API
        const tasks = await taskApi.getAll();
        
        // Répartir les tâches dans les bonnes colonnes
        const newColumns = columns.map(col => ({
          ...col,
          tasks: tasks.filter(task => task.status === col.id)
        }));
        
        setColumns(newColumns);
        console.log('Tâches chargées depuis l\'API');
      } catch (err) {
        console.error('Erreur API, utilisation des données locales:', err);
        
        // Fallback aux données mockées si l'API échoue
        const initialTasks: Task[] = [
          {
            id: 'task-1',
            title: 'Déployer sur Docker',
            description: 'Configurer les containers et docker-compose pour le déploiement',
            priority: 'high',
            labels: ['docker', 'devops', 'déploiement'],
            status: 'todo',
            assignee: 'Alex Martin',
            dueDate: format(new Date(Date.now() + 86400000), 'dd/MM/yyyy'),
            createdAt: format(new Date(), 'dd/MM/yyyy HH:mm')
          },
          {
            id: 'task-2',
            title: 'Développer interface utilisateur',
            description: 'Créer les composants React avec TypeScript et tests unitaires',
            priority: 'medium',
            labels: ['frontend', 'react', 'typescript'],
            status: 'inprogress',
            assignee: 'Maya Dubois',
            dueDate: format(new Date(Date.now() + 86400000 * 3), 'dd/MM/yyyy'),
            createdAt: format(new Date(Date.now() - 86400000), 'dd/MM/yyyy HH:mm')
          },
          {
            id: 'task-3',
            title: 'Configurer base de données',
            description: 'Mettre en place MongoDB avec les schémas et index',
            priority: 'medium',
            labels: ['database', 'mongodb'],
            status: 'review',
            assignee: 'Thomas Leroy',
            dueDate: format(new Date(Date.now() + 86400000 * 2), 'dd/MM/yyyy'),
            createdAt: format(new Date(Date.now() - 86400000 * 2), 'dd/MM/yyyy HH:mm')
          },
          {
            id: 'task-4',
            title: "Tests d'intégration",
            description: "Valider le fonctionnement complet avec tests automatisés",
            priority: 'low',
            labels: ['testing', 'qa', 'automation'],
            status: 'done',
            assignee: 'Équipe QA',
            dueDate: format(new Date(Date.now() - 86400000), 'dd/MM/yyyy'),
            createdAt: format(new Date(Date.now() - 86400000 * 3), 'dd/MM/yyyy HH:mm')
          },
        ];

        const newColumns = columns.map(col => ({
          ...col,
          tasks: initialTasks.filter(task => task.status === col.id)
        }));

        setColumns(newColumns);
      }
    };

    loadTasks();
  }, [columns]);

  const handleAddTask = async () => {
    console.log("handleAddTask called", newTask);
    if (!newTask.title?.trim()) return;
    
    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description || '',
      priority: newTask.priority || 'medium',
      labels: newTask.labels || [],
      status: 'todo',
      dueDate: newTask.dueDate,
      assignee: newTask.assignee || 'Non assigné',
      createdAt: new Date().toISOString().split('T')[0]
    };

    try {
      // 1. ENVOIE À L'API
      await taskApi.create(task);  // ← APPEL API
    
      // 2. Mets à jour l'interface
      setColumns(prev => prev.map(col =>
        col.id === 'todo'
          ? { ...col, tasks: [...col.tasks, task] }
          : col
      ));
    } catch (error) {
      console.error('Erreur création tâche:', error);
      // Fallback : ajoute localement au moins
      setColumns(prev => prev.map(col =>
        col.id === 'todo'
          ? { ...col, tasks: [...col.tasks, task] }
          : col
      ));
    }

    // Réinitialiser le formulaire
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      labels: [],
      status: 'todo'
    });
    setShowTaskForm(false);
  };

  const exportReport = () => {
    const report = `=== RAPPORT KANBANFLOW ===
Date: ${format(new Date(), 'dd/MM/yyyy HH:mm')}

STATISTIQUES:
- Tâches totales: ${columns.reduce((acc, col) => acc + col.tasks.length, 0)}
- À faire: ${columns.find(c => c.id === 'todo')?.tasks.length || 0}
- En cours: ${columns.find(c => c.id === 'inprogress')?.tasks.length || 0}
- En revue: ${columns.find(c => c.id === 'review')?.tasks.length || 0}
- Terminées: ${columns.find(c => c.id === 'done')?.tasks.length || 0}
- Membres impliqués: ${new Set(columns.flatMap(c => c.tasks.map(t => t.assignee)).filter(Boolean)).size}

DÉTAILS:${columns.map(col => `
${col.title.toUpperCase()} (${col.tasks.length}):
${col.tasks.map(t => `  [${t.priority}] ${t.title} 
     Assigné à: ${t.assignee || 'Non assigné'}
     Échéance: ${t.dueDate || 'Non définie'}
     Créé le: ${t.createdAt}
     Labels: ${t.labels.join(', ')}`).join('\n')}`).join('')}

=== FIN DU RAPPORT ===`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kanbanflow-${format(new Date(), 'yyyy-MM-dd-HHmm')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const moveTask = async (taskId: string, fromColumnId: string, toColumnId: string) => {
  try {
    // 1. Trouve la tâche
    const taskToUpdate = columns
      .find(col => col.id === fromColumnId)
      ?.tasks.find(t => t.id === taskId);
    
    if (!taskToUpdate) return;

    // 2. Met à jour l'API
    await taskApi.update(taskId, {
      ...taskToUpdate,
      status: toColumnId as Task['status']
    });

    // 3. Met à jour l'interface
    setColumns(prev => {
      const newColumns = [...prev];
      const fromCol = newColumns.find(c => c.id === fromColumnId);
      const toCol = newColumns.find(c => c.id === toColumnId);

      if (!fromCol || !toCol) return prev;

      const taskIndex = fromCol.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return prev;

      const [task] = fromCol.tasks.splice(taskIndex, 1);
      const updatedTask = { ...task, status: toColumnId as Task['status'] };
      toCol.tasks.push(updatedTask);

      return newColumns;
    });
   } catch (error) {
     console.error('Erreur déplacement tâche:', error);
   }
  };

  // Styles cohérents
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
      color: darkMode ? '#e2e8f0' : '#1e293b',
      padding: '2rem',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      transition: 'background-color 0.3s ease, color 0.3s ease'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      flexWrap: 'wrap' as const,
      gap: '1.5rem'
    },
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    logo: {
      width: '52px',
      height: '52px',
      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '22px',
      fontWeight: 'bold',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '800',
      margin: '0',
      color: darkMode ? '#3b82f6' : '#1e40af',
      textShadow: darkMode ? 'none' : '0 1px 2px rgba(0,0,0,0.1)'
    },
    subtitle: {
      fontSize: '1.1rem',
      color: darkMode ? '#94a3b8' : '#64748b',
      margin: '0.5rem 0 0 0',
      fontWeight: '400'
    },
    buttonGroup: {
      display: 'flex',
      gap: '0.75rem',
      flexWrap: 'wrap' as const
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '50px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.95rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      color: 'white',
      border: 'none'
    },
    secondaryButton: {
      backgroundColor: darkMode ? '#334155' : '#e2e8f0',
      color: darkMode ? '#e2e8f0' : '#334155',
      border: `2px solid ${darkMode ? '#475569' : '#cbd5e1'}`
    },
    card: {
      backgroundColor: darkMode ? '#1e293b' : 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)',
      padding: '1.5rem',
      marginBottom: '1rem',
      transition: 'all 0.2s ease'
    },
    columnContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginTop: '2rem'
    }
  };

  return (
    <div style={styles.container as any}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* En-tête */}
        <div style={styles.header}>
          <div>
            <div style={styles.titleContainer}>
              <div style={styles.logo}>
                KF
              </div>
              <div>
                <h1 style={styles.title}>
                  KanbanFlow
                </h1>
                <p style={styles.subtitle}>
                  Gestion de projets collaborative et efficace
                </p>
              </div>
            </div>
          </div>
          
          <div style={styles.buttonGroup}>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              style={{
                ...styles.button,
                ...styles.secondaryButton
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>
                {darkMode ? '☀️' : '🌙'}
              </span>
              {darkMode ? ' Mode clair' : ' Mode sombre'}
            </button>
            
            <button 
              onClick={exportReport}
              style={{
                ...styles.button,
                ...styles.primaryButton
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>📊</span>
              Exporter rapport
            </button>
            
            <button 
              onClick={() => setShowTaskForm(true)}
              style={{
                ...styles.button,
                ...styles.primaryButton
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>+</span>
              Nouvelle tâche
            </button>
          </div>
        </div>

        {/* Formulaire pour nouvelle tâche */}
        {showTaskForm && (
          <div style={{
            ...styles.card,
            marginBottom: '2rem',
            border: `2px solid #3b82f6`,
            animation: 'slideIn 0.3s ease-out'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              color: darkMode ? '#e2e8f0' : '#1e293b',
              fontSize: '1.25rem'
            }}>
              ✨ Créer une nouvelle tâche
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: `1px solid ${darkMode ? '#475569' : '#cbd5e1'}`,
                    backgroundColor: darkMode ? '#1e293b' : 'white',
                    color: darkMode ? '#e2e8f0' : '#1e293b',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                  placeholder="Titre de la tâche *"
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${darkMode ? '#475569' : '#cbd5e1'}`,
                      backgroundColor: darkMode ? '#1e293b' : 'white',
                      color: darkMode ? '#e2e8f0' : '#1e293b',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="low">📗 Priorité basse</option>
                    <option value="medium">📒 Priorité moyenne</option>
                    <option value="high">📕 Priorité élevée</option>
                  </select>
                </div>
                
                <div>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${darkMode ? '#475569' : '#cbd5e1'}`,
                      backgroundColor: darkMode ? '#1e293b' : 'white',
                      color: darkMode ? '#e2e8f0' : '#1e293b',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>
              
              <div>
                <input
                  type="text"
                  value={newTask.assignee || ''}
                  onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: `1px solid ${darkMode ? '#475569' : '#cbd5e1'}`,
                    backgroundColor: darkMode ? '#1e293b' : 'white',
                    color: darkMode ? '#e2e8f0' : '#1e293b',
                    fontSize: '1rem'
                  }}
                  placeholder="👤 Nom de la personne assignée *"
                />
              </div>
              
              <div>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: `1px solid ${darkMode ? '#475569' : '#cbd5e1'}`,
                    backgroundColor: darkMode ? '#1e293b' : 'white',
                    color: darkMode ? '#e2e8f0' : '#1e293b',
                    fontSize: '1rem',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                  placeholder="📝 Description détaillée de la tâche"
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowTaskForm(false)}
                  style={{
                    ...styles.button,
                    ...styles.secondaryButton,
                    padding: '0.75rem 2rem'
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddTask}
                  disabled={!newTask.title?.trim() || !newTask.assignee?.trim()}
                  style={{
                    ...styles.button,
                    ...styles.primaryButton,
                    padding: '0.75rem 2rem',
                    opacity: (!newTask.title?.trim() || !newTask.assignee?.trim()) ? 0.5 : 1,
                    cursor: (!newTask.title?.trim() || !newTask.assignee?.trim()) ? 'not-allowed' : 'pointer'
                  }}
                >
                  ✅ Créer la tâche
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tableau Kanban */}
        <div style={styles.columnContainer}>
          {columns.map((column) => (
            <div key={column.id} style={{
              ...styles.card,
              borderTop: `4px solid ${
                column.id === 'todo' ? '#3b82f6' :
                column.id === 'inprogress' ? '#f59e0b' :
                column.id === 'review' ? '#8b5cf6' : '#10b981'
              }`
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '1.5rem' 
              }}>
                <div>
                  <h3 style={{ 
                    fontWeight: '700', 
                    fontSize: '1.25rem', 
                    margin: '0 0 0.25rem 0',
                    color: darkMode ? '#e2e8f0' : '#1e293b'
                  }}>
                    {column.title}
                  </h3>
                  <p style={{ 
                    fontSize: '0.875rem',
                    color: darkMode ? '#94a3b8' : '#64748b',
                    margin: 0
                  }}>
                    {column.id === 'todo' && 'Tâches à démarrer'}
                    {column.id === 'inprogress' && 'En cours de réalisation'}
                    {column.id === 'review' && 'En attente de validation'}
                    {column.id === 'done' && 'Tâches finalisées'}
                  </p>
                </div>
                <span style={{
                  backgroundColor: darkMode ? '#334155' : '#e2e8f0',
                  color: darkMode ? '#e2e8f0' : '#475569',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  minWidth: '40px',
                  textAlign: 'center' as const
                }}>
                  {column.tasks.length}
                </span>
              </div>
              
              <div style={{ minHeight: '450px' }}>
                {column.tasks.map((task) => (
                  <div 
                    key={task.id} 
                    style={{
                      ...styles.card,
                      backgroundColor: darkMode ? '#334155' : '#f8fafc',
                      marginBottom: '1rem',
                      cursor: 'grab',
                      padding: '1.25rem'
                    }}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', JSON.stringify({
                        taskId: task.id,
                        fromColumnId: column.id
                      }));
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      try {
                        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                        if (data.fromColumnId !== column.id) {
                          moveTask(data.taskId, data.fromColumnId, column.id);
                        }
                      } catch (error) {
                        console.log('Erreur lors du déplacement:', error);
                      }
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      marginBottom: '0.75rem' 
                    }}>
                      <h4 style={{ 
                        fontWeight: '600', 
                        margin: 0, 
                        fontSize: '1rem',
                        color: darkMode ? '#f1f5f9' : '#1e293b',
                        flex: 1
                      }}>
                        {task.title}
                      </h4>
                      <span style={{
                        padding: '0.3rem 0.7rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: 
                          task.priority === 'high' ? '#fef2f2' :
                          task.priority === 'medium' ? '#fffbeb' : '#f0fdf4',
                        color: 
                          task.priority === 'high' ? '#dc2626' :
                          task.priority === 'medium' ? '#d97706' : '#16a34a',
                        border: `1px solid ${
                          task.priority === 'high' ? '#fecaca' :
                          task.priority === 'medium' ? '#fde68a' : '#bbf7d0'
                        }`
                      }}>
                        {task.priority === 'high' ? '🚨 Élevée' : task.priority === 'medium' ? '⚠️ Moyenne' : '✅ Basse'}
                      </span>
                    </div>
                    
                    <p style={{ 
                      fontSize: '0.9rem', 
                      color: darkMode ? '#cbd5e1' : '#64748b',
                      marginBottom: '1rem',
                      lineHeight: '1.5'
                    }}>
                      {task.description}
                    </p>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                      {task.labels.map((label, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '0.3rem 0.7rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            backgroundColor: darkMode ? '#475569' : '#e2e8f0',
                            color: darkMode ? '#e2e8f0' : '#475569',
                            fontWeight: '500'
                          }}
                        >
                          #{label}
                        </span>
                      ))}
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column' as const,
                      gap: '0.75rem',
                      borderTop: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                      paddingTop: '0.75rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          <span style={{ 
                            color: darkMode ? '#94a3b8' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.85rem'
                          }}>
                            <span style={{ fontSize: '1rem' }}>👤</span> {task.assignee}
                          </span>
                          {task.dueDate && (
                            <span style={{ 
                              color: darkMode ? '#94a3b8' : '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.85rem'
                            }}>
                              <span style={{ fontSize: '1rem' }}>📅</span> {task.dueDate}
                            </span>
                          )}
                        </div>
                        
                        <span style={{ 
                          color: darkMode ? '#94a3b8' : '#64748b',
                          fontSize: '0.8rem',
                          fontStyle: 'italic'
                        }}>
                          Créé: {task.createdAt}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {column.id !== 'todo' && (
                          <button
                            onClick={() => {
                              const prevColumn = columns.find(c => 
                                c.id === (column.id === 'inprogress' ? 'todo' : 
                                         column.id === 'review' ? 'inprogress' : 'review')
                              );
                              if (prevColumn) {
                                moveTask(task.id, column.id, prevColumn.id);
                              }
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: darkMode ? '#475569' : '#e2e8f0',
                              color: darkMode ? '#e2e8f0' : '#475569',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              fontWeight: '500',
                              minWidth: '80px',
                              textAlign: 'center' as const
                            }}
                          >
                            ← Retour
                          </button>
                        )}
                        
                        {column.id !== 'done' && (
                          <button
                            onClick={() => {
                              const nextColumn = columns.find(c => 
                                c.id === (column.id === 'todo' ? 'inprogress' : 
                                         column.id === 'inprogress' ? 'review' : 'done')
                              );
                              if (nextColumn) {
                                moveTask(task.id, column.id, nextColumn.id);
                              }
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              fontWeight: '500',
                              minWidth: '80px',
                              textAlign: 'center' as const
                            }}
                          >
                            {column.id === 'review' ? 'Terminer →' : 'Suivant →'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {column.tasks.length === 0 && (
                  <div style={{
                    padding: '2rem 1rem',
                    textAlign: 'center' as const,
                    color: darkMode ? '#94a3b8' : '#64748b',
                    fontStyle: 'italic',
                    border: `2px dashed ${darkMode ? '#475569' : '#cbd5e1'}`,
                    borderRadius: '8px'
                  }}>
                    Aucune tâche dans cette colonne
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Statistiques améliorées */}
        <div style={{ 
          marginTop: '3rem', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem' 
        }}>
          <div style={{
            ...styles.card,
            borderLeft: '4px solid #3b82f6',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#dbeafe',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1d4ed8'
              }}>
                📊
              </div>
              <div>
                <h3 style={{ 
                  fontWeight: '700', 
                  margin: '0 0 0.25rem 0',
                  color: darkMode ? '#e2e8f0' : '#1e293b',
                  fontSize: '1.1rem'
                }}>
                  Vue d'ensemble
                </h3>
                <p style={{ 
                  color: darkMode ? '#94a3b8' : '#64748b',
                  margin: 0,
                  fontSize: '0.9rem'
                }}>
                  Progression du projet
                </p>
              </div>
            </div>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '800',
              color: '#3b82f6',
              marginTop: '0.5rem'
            }}>
              {columns.reduce((acc, col) => acc + col.tasks.length, 0)}
            </div>
            <div style={{ 
              fontSize: '0.9rem',
              color: darkMode ? '#94a3b8' : '#64748b'
            }}>
              Tâches totales
            </div>
          </div>
          
          <div style={{
            ...styles.card,
            borderLeft: '4px solid #10b981',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#dcfce7',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16a34a'
              }}>
                ✅
              </div>
              <div>
                <h3 style={{ 
                  fontWeight: '700', 
                  margin: '0 0 0.25rem 0',
                  color: darkMode ? '#e2e8f0' : '#1e293b',
                  fontSize: '1.1rem'
                }}>
                  Achèvement
                </h3>
                <p style={{ 
                  color: darkMode ? '#94a3b8' : '#64748b',
                  margin: 0,
                  fontSize: '0.9rem'
                }}>
                  Tâches finalisées
                </p>
              </div>
            </div>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '800',
              color: '#10b981',
              marginTop: '0.5rem'
            }}>
              {columns.find(col => col.id === 'done')?.tasks.length || 0}
            </div>
            <div style={{ 
              fontSize: '0.9rem',
              color: darkMode ? '#94a3b8' : '#64748b'
            }}>
              Terminées
            </div>
          </div>
          
          <div style={{
            ...styles.card,
            borderLeft: '4px solid #f59e0b',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#fef3c7',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706'
              }}>
                ⚡
              </div>
              <div>
                <h3 style={{ 
                  fontWeight: '700', 
                  margin: '0 0 0.25rem 0',
                  color: darkMode ? '#e2e8f0' : '#1e293b',
                  fontSize: '1.1rem'
                }}>
                  En cours
                </h3>
                <p style={{ 
                  color: darkMode ? '#94a3b8' : '#64748b',
                  margin: 0,
                  fontSize: '0.9rem'
                }}>
                  Tâches actives
                </p>
              </div>
            </div>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '800',
              color: '#f59e0b',
              marginTop: '0.5rem'
            }}>
              {columns.find(col => col.id === 'inprogress')?.tasks.length || 0}
            </div>
            <div style={{ 
              fontSize: '0.9rem',
              color: darkMode ? '#94a3b8' : '#64748b'
            }}>
              En réalisation
            </div>
          </div>
          
          <div style={{
            ...styles.card,
            borderLeft: '4px solid #8b5cf6',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#f3e8ff',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7c3aed'
              }}>
                👥
              </div>
              <div>
                <h3 style={{ 
                  fontWeight: '700', 
                  margin: '0 0 0.25rem 0',
                  color: darkMode ? '#e2e8f0' : '#1e293b',
                  fontSize: '1.1rem'
                }}>
                  Équipe
                </h3>
                <p style={{ 
                  color: darkMode ? '#94a3b8' : '#64748b',
                  margin: 0,
                  fontSize: '0.9rem'
                }}>
                  Collaboration
                </p>
              </div>
            </div>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '800',
              color: '#8b5cf6',
              marginTop: '0.5rem'
            }}>
              4
            </div>
            <div style={{ 
              fontSize: '0.9rem',
              color: darkMode ? '#94a3b8' : '#64748b'
            }}>
              Membres actifs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
