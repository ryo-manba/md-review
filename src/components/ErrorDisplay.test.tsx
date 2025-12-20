import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ErrorDisplay } from './ErrorDisplay';

describe('ErrorDisplay', () => {
  it('should display error message', () => {
    const error = new Error('Something went wrong');
    render(<ErrorDisplay error={error} />);

    expect(screen.getByRole('heading', { name: 'Error' })).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should display error object message correctly', () => {
    const error = new Error('Network connection failed');
    render(<ErrorDisplay error={error} />);

    expect(screen.getByText('Network connection failed')).toBeInTheDocument();
  });

  it('should have appropriate styling for error container', () => {
    const error = new Error('Test error');
    const { container } = render(<ErrorDisplay error={error} />);

    const errorDiv = container.querySelector('div');
    expect(errorDiv).toHaveStyle({
      backgroundColor: '#fee',
    });
  });
});
