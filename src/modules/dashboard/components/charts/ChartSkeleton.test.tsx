import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChartSkeleton } from './ChartSkeleton';

describe('ChartSkeleton', () => {
  it('renders with status role', () => {
    render(<ChartSkeleton />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has accessible loading label', () => {
    render(<ChartSkeleton />);
    expect(screen.getByLabelText('Loading chart')).toBeInTheDocument();
  });

  it('has sr-only loading text', () => {
    render(<ChartSkeleton />);
    expect(screen.getByText('Loading chart...')).toBeInTheDocument();
  });

  it('renders with default height of 320px', () => {
    const { container } = render(<ChartSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.style.height).toBe('320px');
  });

  it('renders with custom height', () => {
    const { container } = render(<ChartSkeleton height="500px" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.style.height).toBe('500px');
  });

  it('applies animate-pulse class', () => {
    const { container } = render(<ChartSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.className).toContain('animate-pulse');
  });

  it('applies custom className', () => {
    const { container } = render(<ChartSkeleton className="my-custom" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton.className).toContain('my-custom');
  });

  it('renders Y-axis label placeholders', () => {
    const { container } = render(<ChartSkeleton />);
    // 5 y-axis labels + 12 bars + 6 x-axis labels = multiple gray divs
    const grayDivs = container.querySelectorAll('.bg-gray-200');
    expect(grayDivs.length).toBeGreaterThan(0);
  });
});
