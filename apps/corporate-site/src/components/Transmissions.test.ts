import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import Transmissions from './Transmissions.svelte';

test('renders transmission updates', () => {
  const updates = [
    { id: 1, date: '2026.04.27', message: 'Node #0412 Online' },
    { id: 2, date: '2026.04.26', message: 'Security Audit Passed' }
  ];
  
  render(Transmissions, { updates });
  
  expect(screen.getByText(/Node #0412 Online/i)).toBeDefined();
  expect(screen.getByText(/2026.04.27/i)).toBeDefined();
  expect(screen.getByText(/Security Audit Passed/i)).toBeDefined();
});

test('renders empty state message', () => {
  render(Transmissions, { updates: [] });
  expect(screen.getByText(/NO ACTIVE TRANSMISSIONS/i)).toBeDefined();
});
