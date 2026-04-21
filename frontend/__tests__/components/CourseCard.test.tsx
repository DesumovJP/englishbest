import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourseCard } from '@/components/molecules/CourseCard';

const baseProps = {
  title: 'English for Kids — Starter',
  teacherName: 'Olga Kovalenko',
  level: 'A1',
  price: 19.99,
  courseSlug: 'english-kids-starter',
  thumbnail: '/images/courses/kids-starter.png',
  rating: 4.8,
  reviewCount: 124,
};

describe('CourseCard', () => {
  it('renders title and teacher name', () => {
    render(<CourseCard {...baseProps} />);
    expect(screen.getByText('English for Kids — Starter')).toBeInTheDocument();
    expect(screen.getByText(/Olga Kovalenko/)).toBeInTheDocument();
  });

  it('renders level badge', () => {
    render(<CourseCard {...baseProps} />);
    expect(screen.getByText('A1')).toBeInTheDocument();
  });

  it('renders price', () => {
    render(<CourseCard {...baseProps} />);
    expect(screen.getByText('$19.99')).toBeInTheDocument();
  });

  it('renders rating and review count', () => {
    render(<CourseCard {...baseProps} />);
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('(124)')).toBeInTheDocument();
  });

  it('renders Add button when not enrolled and available', () => {
    render(<CourseCard {...baseProps} status="available" isEnrolled={false} />);
    expect(screen.getByRole('button', { name: /Add english for kids/i })).toBeInTheDocument();
  });

  it('shows Added button when already enrolled', () => {
    render(<CourseCard {...baseProps} status="available" isEnrolled={true} />);
    expect(screen.getByRole('button', { name: /Added/i })).toBeDisabled();
  });

  it('calls onAddToLearning with courseSlug when Add is clicked', async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();
    render(
      <CourseCard {...baseProps} status="available" isEnrolled={false} onAddToLearning={onAdd} />
    );
    await user.click(screen.getByRole('button', { name: /Add/i }));
    expect(onAdd).toHaveBeenCalledWith('english-kids-starter');
  });

  it('shows Coming Soon badge for comingSoon status', () => {
    render(<CourseCard {...baseProps} status="comingSoon" />);
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('links title to the course page', () => {
    render(<CourseCard {...baseProps} />);
    const link = screen.getAllByRole('link').find(
      l => l.getAttribute('href') === '/courses/english-kids-starter'
    );
    expect(link).toBeInTheDocument();
  });
});
