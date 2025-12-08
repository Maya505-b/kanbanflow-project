import { render, screen } from '@testing-library/react';
import App from './App';

test('renders KanbanFlow title', () => {
  render(<App />);
  // Cherche "KanbanFlow" au lieu de "learn react"
  const titleElement = screen.getByText(/KanbanFlow/i);
  expect(titleElement).toBeInTheDocument();
});
