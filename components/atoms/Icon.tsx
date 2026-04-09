interface IconProps {
  name: 'home' | 'book' | 'calendar' | 'user' | 'shop' | 'star' | 'play' | 'check' | 'arrow-right' | 'menu' | 'close' | 'trophy' | 'flame';
  size?: number;
  className?: string;
}

const paths: Record<IconProps['name'], string> = {
  home: 'M3 9.5L10 3l7 6.5V19a1 1 0 01-1 1h-4v-5H8v5H4a1 1 0 01-1-1V9.5z',
  book: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 004 17V4.5A2.5 2.5 0 016.5 2H20v15H6.5a2.5 2.5 0 00-2.5 2.5z',
  calendar: 'M8 2v3M16 2v3M3.5 9h17M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  shop: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  play: 'M5 3l14 9-14 9V3z',
  check: 'M20 6L9 17l-5-5',
  'arrow-right': 'M5 12h14M12 5l7 7-7 7',
  menu: 'M3 12h18M3 6h18M3 18h18',
  close: 'M18 6L6 18M6 6l12 12',
  trophy: 'M8 21h8M12 17v4M17 3H7l1 7a4 4 0 008 0l1-7zM5 3H3v4a4 4 0 004 4M19 3h2v4a4 4 0 01-4 4',
  flame: 'M12 22c-4.4 0-8-3.6-8-8 0-3.5 2.5-6.5 5-8 0 3 2 5 2 5 1-3 3-5.5 3-8 2 2 4 5 4 8-1-1.5-2.5-2-2.5-2 0 2-1 4-1 4s1-1 3 0c0 4-3.6 9-5.5 9z',
};

export function Icon({ name, size = 20, className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={paths[name]} />
    </svg>
  );
}
