import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { getData } from './utils/apis/api';

jest.mock('./utils/apis/api', () => ({
  getData: jest.fn(),
}));

describe('App', () => {
  test('renders list filters after data load', async () => {
    getData.mockResolvedValue({
      births: [],
      events: [],
      holidays: [],
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('button', { name: /rođenja/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /događaji/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /praznici/i })).toBeInTheDocument();
  });
});
