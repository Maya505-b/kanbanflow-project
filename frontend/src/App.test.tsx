import { render, screen } from '@testing-library/react';
import App from './App';

describe('KanbanFlow Application', () => {
  test('renders main application title', () => {
    render(<App />);
    const titleElement = screen.getByText(/KanbanFlow/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders application subtitle', () => {
    render(<App />);
    const subtitleElement = screen.getByText(/Gestion de projets collaborative et efficace/i);
    expect(subtitleElement).toBeInTheDocument();
  });

  test('renders all action buttons', () => {
    render(<App />);
    
    const newTaskButton = screen.getByText(/Nouvelle tâche/i);
    const exportButton = screen.getByText(/Exporter rapport/i);
    const themeButton = screen.getByText(/Mode sombre|Mode clair/i);
    
    expect(newTaskButton).toBeInTheDocument();
    expect(exportButton).toBeInTheDocument();
    expect(themeButton).toBeInTheDocument();
  });

  test('renders all Kanban columns', () => {
    render(<App />);
    
    // Utilise getAllByText car les textes peuvent apparaître plusieurs fois
    expect(screen.getByText('À faire')).toBeInTheDocument();
    expect(screen.getAllByText('En cours').length).toBeGreaterThan(0);
    expect(screen.getAllByText('En revue').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Terminé').length).toBeGreaterThan(0);
  });

  test('renders statistics section', () => {
    render(<App />);
    
    // Teste les titres UNIQUES des cartes statistiques
    expect(screen.getByText("Vue d'ensemble")).toBeInTheDocument();
    expect(screen.getByText("Achèvement")).toBeInTheDocument();
    expect(screen.getByText("Équipe")).toBeInTheDocument();
    
    // Pour "En cours" dans les stats, vérifie qu'il y a au moins un élément
    // qui contient "En cours" dans le contexte des statistiques
    const allEnCoursElements = screen.getAllByText(/En cours/i);
    expect(allEnCoursElements.length).toBeGreaterThanOrEqual(2); // Au moins colonne + stats
  });
});
