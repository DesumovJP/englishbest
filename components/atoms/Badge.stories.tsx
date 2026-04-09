import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger', 'info'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: { children: 'A1', variant: 'default' },
};

export const Success: Story = {
  args: { children: '✓ Completed', variant: 'success' },
};

export const Warning: Story = {
  args: { children: 'In Progress', variant: 'warning' },
};

export const Danger: Story = {
  args: { children: 'Sold Out', variant: 'danger' },
};

export const Info: Story = {
  args: { children: 'B1', variant: 'info' },
};
