import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useDarkMode } from './useDarkMode';

describe('useDarkMode', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('should default to system theme', () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.theme).toBe('system');
  });

  it('should load saved theme from localStorage', () => {
    localStorage.setItem('md-review-theme', 'dark');
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.theme).toBe('dark');
  });

  it('should toggle theme between light and dark', () => {
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDark).toBe(true);

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
    expect(result.current.isDark).toBe(false);
  });

  it('should save theme to localStorage after toggle', () => {
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.toggleTheme();
    });

    expect(localStorage.getItem('md-review-theme')).toBe('dark');
  });

  it('should reset to system theme', () => {
    localStorage.setItem('md-review-theme', 'dark');
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.resetToSystem();
    });

    expect(result.current.theme).toBe('system');
    expect(localStorage.getItem('md-review-theme')).toBeNull();
  });

  it('should add dark-mode class when dark mode is enabled', () => {
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.toggleTheme();
    });

    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
  });

  it('should remove dark-mode class when light mode is enabled', () => {
    document.documentElement.classList.add('dark-mode');
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.toggleTheme();
    });

    act(() => {
      result.current.toggleTheme();
    });

    expect(document.documentElement.classList.contains('dark-mode')).toBe(false);
  });

  it('should have correct isSystem property', () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isSystem).toBe(true);

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.isSystem).toBe(false);
  });
});
