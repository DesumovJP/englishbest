import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: 'Get Started', variant: 'primary', size: 'md' },
};

export const Secondary: Story = {
  args: { children: 'Browse Courses', variant: 'secondary', size: 'md' },
};

export const Outline: Story = {
  args: { children: 'Learn More', variant: 'outline', size: 'md' },
};

export const Ghost: Story = {
  args: { children: 'Cancel', variant: 'ghost', size: 'md' },
};

export const Danger: Story = {
  args: { children: 'Delete', variant: 'danger', size: 'md' },
};

export const Loading: Story = {
  args: { children: 'Saving...', variant: 'primary', size: 'md', loading: true },
};

export const Disabled: Story = {
  args: { children: 'Unavailable', variant: 'primary', size: 'md', disabled: true },
};

export const Small: Story = {
  args: { children: 'Add', variant: 'primary', size: 'sm' },
};

export const Large: Story = {
  args: { children: 'Enroll Now', variant: 'primary', size: 'lg' },
};
