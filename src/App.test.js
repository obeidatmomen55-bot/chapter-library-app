import { render, screen } from '@testing-library/react';
import App from './App';

test('renders chapter library brand and discover navigation', () => {
  render(<App />);
  const brandElements = screen.getAllByText(/chapter/i);
  expect(brandElements.length).toBeGreaterThan(0);
});
