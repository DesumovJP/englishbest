import type { Meta, StoryObj } from '@storybook/react';
import { CourseCard } from './CourseCard';

const meta: Meta<typeof CourseCard> = {
  title: 'Molecules/CourseCard',
  component: CourseCard,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['available', 'soldOut', 'comingSoon'],
    },
    isEnrolled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof CourseCard>;

const baseArgs = {
  title: 'English for Kids — Starter',
  teacherName: 'Olga Kovalenko',
  level: 'A1',
  price: 19.99,
  courseSlug: 'english-kids-starter',
  thumbnail: '/images/courses/kids-starter.png',
  rating: 4.8,
  reviewCount: 124,
};

export const Available: Story = {
  args: { ...baseArgs, status: 'available', isEnrolled: false },
};

export const Enrolled: Story = {
  args: { ...baseArgs, status: 'available', isEnrolled: true },
};

export const ComingSoon: Story = {
  args: { ...baseArgs, status: 'comingSoon', title: 'Business English — B2' },
};

export const SoldOut: Story = {
  args: { ...baseArgs, status: 'soldOut', title: 'Advanced Grammar' },
};
