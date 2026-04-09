import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Atoms/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithInitials: Story = {
  args: { name: 'Alex Kovalenko', size: 'md' },
};

export const Small: Story = {
  args: { name: 'Olga Teacher', size: 'sm' },
};

export const Large: Story = {
  args: { name: 'Max Petrenko', size: 'lg' },
};
