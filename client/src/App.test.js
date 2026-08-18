import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the HunarHub brand and shared navigation', () => {
  render(<App />);
  expect(screen.getByRole('link', { name: /HunarHub/i })).toBeInTheDocument();
  expect(screen.getByText(/Handcrafted commerce marketplace/i)).toBeInTheDocument();
});
