import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChartEmptyState } from './ChartEmptyState';

describe('ChartEmptyState', () => {
  it('renders default message', () => {
    render(<ChartEmptyState />);
    expect(screen.getByText('No data available for this period.')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<ChartEmptyState message="No revenue data found." />);
    expect(screen.getByText('No revenue data found.')).toBeInTheDocument();
  });

  it('does not render default message when custom is provided', () => {
    render(<ChartEmptyState message="Custom" />);
    expect(screen.queryByText('No data available for this period.')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<ChartEmptyState className="my-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('my-class');
  });

  it('renders the chart icon', () => {
    const { container } = render(<ChartEmptyState />);
    // BarChart3 from lucide-react renders as an SVG
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
