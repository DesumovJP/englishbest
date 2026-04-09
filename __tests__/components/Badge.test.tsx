import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/atoms/Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>A1</Badge>);
    expect(screen.getByText('A1')).toBeInTheDocument();
  });

  it('applies success variant classes', () => {
    render(<Badge variant="success">Done</Badge>);
    const badge = screen.getByText('Done');
    expect(badge.className).toContain('text-success-dark');
  });

  it('applies danger variant classes', () => {
    render(<Badge variant="danger">Error</Badge>);
    const badge = screen.getByText('Error');
    expect(badge.className).toContain('text-danger-dark');
  });

  it('applies warning variant classes', () => {
    render(<Badge variant="warning">Pending</Badge>);
    const badge = screen.getByText('Pending');
    expect(badge.className).toContain('text-accent-dark');
  });

  it('applies info variant classes', () => {
    render(<Badge variant="info">B1</Badge>);
    const badge = screen.getByText('B1');
    expect(badge.className).toContain('text-secondary-dark');
  });

  it('applies default variant by default', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge.className).toContain('text-ink-muted');
  });

  it('merges custom className', () => {
    render(<Badge className="mt-2">Custom</Badge>);
    expect(screen.getByText('Custom').className).toContain('mt-2');
  });
});
