import { render, screen } from '@testing-library/react';
import { type UserEvent, userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { ThemeToggle } from './ThemeToggle';
import * as useDarkModeModule from '../hooks/useDarkMode';

vi.mock('../hooks/useDarkMode');

describe('ThemeToggle', () => {
  let user: UserEvent;

  beforeAll(() => {
    user = userEvent.setup();
  });

  it('should display moon icon in light mode', () => {
    vi.mocked(useDarkModeModule.useDarkMode).mockReturnValue({
      isDark: false,
      toggleTheme: vi.fn(),
      theme: 'light',
      effectiveTheme: 'light',
      resetToSystem: vi.fn(),
      isSystem: false,
    });

    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: 'Switch to dark mode' });
    expect(button).toBeInTheDocument();
  });

  it('should display sun icon in dark mode', () => {
    vi.mocked(useDarkModeModule.useDarkMode).mockReturnValue({
      isDark: true,
      toggleTheme: vi.fn(),
      theme: 'dark',
      effectiveTheme: 'dark',
      resetToSystem: vi.fn(),
      isSystem: false,
    });

    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: 'Switch to light mode' });
    expect(button).toBeInTheDocument();
  });

  it('should call toggleTheme when clicked', async () => {
    const toggleThemeMock = vi.fn();
    vi.mocked(useDarkModeModule.useDarkMode).mockReturnValue({
      isDark: false,
      toggleTheme: toggleThemeMock,
      theme: 'light',
      effectiveTheme: 'light',
      resetToSystem: vi.fn(),
      isSystem: false,
    });

    render(<ThemeToggle />);

    const button = screen.getByRole('button', { name: 'Switch to dark mode' });
    await user.click(button);

    expect(toggleThemeMock).toHaveBeenCalledTimes(1);
  });

  it('should have appropriate aria-label', () => {
    vi.mocked(useDarkModeModule.useDarkMode).mockReturnValue({
      isDark: false,
      toggleTheme: vi.fn(),
      theme: 'light',
      effectiveTheme: 'light',
      resetToSystem: vi.fn(),
      isSystem: false,
    });

    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: 'Switch to dark mode' });
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
  });
});
