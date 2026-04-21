'use client';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Icon } from '@/components/atoms/Icon';
import { useState } from 'react';

interface CourseCardProps {
  title: string;
  teacherName: string;
  level: string;
  price: number;
  courseSlug: string;
  thumbnail: string;
  rating?: number;
  reviewCount?: number;
  status?: 'available' | 'soldOut' | 'comingSoon';
  isEnrolled?: boolean;
  onAddToLearning?: (courseSlug: string) => void;
}

export function CourseCard({
  title,
  teacherName,
  level,
  price,
  courseSlug,
  thumbnail,
  rating,
  reviewCount,
  status = 'available',
  isEnrolled = false,
  onAddToLearning,
}: CourseCardProps) {
  const [added, setAdded] = useState(isEnrolled);

  const handleAdd = () => {
    setAdded(true);
    onAddToLearning?.(courseSlug);
  };

  return (
    <article className="bg-white rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow flex flex-col">
      <Link href={`/courses/${courseSlug}`} className="block">
        <div className="aspect-video bg-gradient-to-br from-primary-light to-secondary flex items-center justify-center relative">
          <span className="text-5xl">📚</span>
          {status === 'comingSoon' && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Badge variant="warning">Coming Soon</Badge>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/courses/${courseSlug}`}>
            <h3 className="font-bold text-ink leading-snug hover:text-primary transition-colors">{title}</h3>
          </Link>
          <Badge variant="info">{level}</Badge>
        </div>
        <p className="text-sm text-ink-muted">👩‍🏫 {teacherName}</p>
        {rating !== undefined && (
          <div className="flex items-center gap-1 text-sm text-accent">
            <Icon name="star" size={14} className="fill-current" />
            <span className="font-semibold">{rating}</span>
            <span className="text-ink-muted">({reviewCount})</span>
          </div>
        )}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xl font-extrabold text-ink">${price}</span>
          {status === 'available' ? (
            added ? (
              <Button size="sm" variant="outline" disabled>
                <Icon name="check" size={14} /> Added
              </Button>
            ) : (
              <Button size="sm" onClick={handleAdd} aria-label={`Add ${title} to learning`}>
                + Add
              </Button>
            )
          ) : (
            <Button size="sm" variant="ghost" disabled>
              {status === 'comingSoon' ? 'Notify Me' : 'Sold Out'}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
