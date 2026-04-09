import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/atoms/Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
  });

  it('is disabled and shows spinner when loading', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button', { name: 'Loading' });
    expect(button).toBeDisabled();
    // spinner span is rendered
    expect(button.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>No click</Button>);
    await user.click(screen.getByRole('button', { name: 'No click' }));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies primary variant classes by default', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole('button', { name: 'Primary' });
    expect(button.className).toContain('bg-primary');
  });

  it('applies danger variant classes', () => {
    render(<Button variant="danger">Delete</Button>);
    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button.className).toContain('bg-danger');
  });
});
