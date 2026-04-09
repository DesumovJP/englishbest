/* Словник: англійське слово → емодзі.
   Пошук регістронезалежний, за першим збігом. */
const EMOJI_MAP: Record<string, string> = {
  // Їжа та напої
  apple: '🍎', bread: '🍞', milk: '🥛', water: '💧', juice: '🧃',
  cake: '🎂', tea: '🍵', coffee: '☕', banana: '🍌', orange: '🍊',
  egg: '🥚', cheese: '🧀', pizza: '🍕', soup: '🍲', rice: '🍚',
  // Тварини
  cat: '🐱', dog: '🐶', bird: '🐦', fish: '🐟', rabbit: '🐰',
  horse: '🐴', cow: '🐄', pig: '🐷', duck: '🦆', bear: '🐻',
  // Кольори
  red: '🔴', blue: '🔵', green: '🟢', yellow: '🟡', 'orange color': '🟠',
  purple: '🟣', white: '⚪', black: '⚫', pink: '🩷', brown: '🟤',
  // Числа
  one: '1️⃣', two: '2️⃣', three: '3️⃣', four: '4️⃣', five: '5️⃣',
  six: '6️⃣', seven: '7️⃣', eight: '8️⃣', nine: '9️⃣', ten: '🔟',
  // Дім і кімнати
  kitchen: '🍳', bedroom: '🛏️', bathroom: '🚿', garden: '🌿',
  window: '🪟', door: '🚪', table: '🪑', chair: '🪑',
  'living room': '🛋️',
  // Дії / розпорядок дня
  'wake up': '⏰', breakfast: '🥐', school: '🏫', homework: '📚',
  sleep: '😴', 'go to bed': '🌙', 'watch tv': '📺', play: '🎮',
  // Вітання
  hello: '👋', hi: '👋', goodbye: '👋', 'good morning': '🌅',
  'good night': '🌙', 'good evening': '🌆',
  // Інші часті слова
  sun: '☀️', moon: '🌙', star: '⭐', house: '🏠', car: '🚗',
  book: '📖', pen: '✏️', ball: '⚽', tree: '🌳', flower: '🌸',
  heart: '❤️', music: '🎵', sport: '🏃', family: '👨‍👩‍👧', friend: '🤝',
};

export function getEmoji(word: string): string | null {
  const key = word.toLowerCase().trim();
  return EMOJI_MAP[key] ?? null;
}
