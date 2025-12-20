import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should set initial value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', { value: 'initial' }));
    expect(result.current[0]).toEqual({ value: 'initial' });
  });

  it('should load stored value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify({ value: 'stored' }));
    const { result } = renderHook(() => useLocalStorage('test-key', { value: 'initial' }));
    expect(result.current[0]).toEqual({ value: 'stored' });
  });

  it('should save to localStorage after setValue', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', { value: 'initial' }));

    act(() => {
      result.current[1]({ value: 'updated' });
    });

    expect(localStorage.getItem('test-key')).toBe(JSON.stringify({ value: 'updated' }));
  });

  it('should correctly save and load objects', () => {
    const testObj = { name: 'test', count: 42, nested: { deep: true } };
    const { result } = renderHook(() => useLocalStorage('test-key', testObj));

    act(() => {
      result.current[1](testObj);
    });

    expect(result.current[0]).toEqual(testObj);

    const { result: result2 } = renderHook(() => useLocalStorage('test-key', {}));

    expect(result2.current[0]).toEqual(testObj);
  });

  it('should work with function form setValue', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', { count: 0 }));

    act(() => {
      result.current[1]((prev) => ({ count: prev.count + 1 }));
    });

    expect(result.current[0]).toEqual({ count: 1 });
  });

  it('should use initial value when data is invalid', () => {
    localStorage.setItem('test-key', 'invalid-json');
    const { result } = renderHook(() => useLocalStorage('test-key', { value: 'initial' }));
    expect(result.current[0]).toEqual({ value: 'initial' });
  });

  it('should use initial value when data is primitive', () => {
    localStorage.setItem('test-key', JSON.stringify('string-value'));
    const { result } = renderHook(() => useLocalStorage('test-key', { value: 'initial' }));
    expect(result.current[0]).toEqual({ value: 'initial' });
  });
});
