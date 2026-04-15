# Character System & Kids Zone — Plan

## Персонажі (виконано ✅)

- [x] PNG assets у `public/characters/fox/` та `public/characters/raccoon/`
- [x] `lib/characters.ts` — реєстр + `getCharacterImage()`
- [x] `components/kids/CharacterAvatar.tsx` — продакшн-компонент
- [x] `CharacterDisplay` → делегує до CharacterAvatar
- [x] Dashboard, Room, Characters/Profile — використовують CharacterAvatar

---

## Поточні задачі

### Крок A — Footer: прибрати Rooms, додати Home ✅
- [x] A1. Прибрати вкладку Rooms + PortalModal з KidsFooter
- [x] A2. Додати вкладку Home → `/kids/dashboard`
- [x] A3. Активний стан Home = pathname === '/kids/dashboard'

### Крок B — Dashboard = Кімната ✅
- [x] B2. Підняти персонажа вище (justify-center з paddingBottom:60)
- [x] B3. Виправити клік → пряма CharacterEmotion, bubble тільки на тап, auto-hide 2.5s

### Крок C — Видалити мертвий код Rooms ✅
- [x] C1. Видалити `app/(kids)/kids/room/page.tsx` та директорію
- [x] C2. Видалити `lib/kids-rooms.ts`
- [x] C3. `activeCharacterId` default: `owl_default` → `fox`
- [x] C4. Footer: прибрато PortalModal, useCustomRooms, useRouter

### Крок D — Уроки: прибрати сову, рідкісні репліки ✅
- [x] D1. `LessonCharacter` — bubble тільки для correct/wrong, idle мовчить, auto-hide 2.8s
- [x] D2. OwlBody SVG прибрано — замінено на CharacterAvatar

### Крок E — Build ✅
- [x] E1. `npm run build` — 45/45 сторінок, 0 помилок

---

## Архітектура Dashboard-як-Кімната

```
Dashboard (h-[100dvh])
  └── bg image (kidsState.roomBackground ?? default)
  └── overlay (gradient top/bottom)
  └── HUD кнопки (top-left: gifts/cal, top-right: coins/streak)
  └── CharacterAvatar (center, клік → emotion cycle)
  └── Speech bubble (рідко: при emotion-зміні або рідкісний idle)
  └── CTA panel (bottom, над footer)
  └── KidsFooter (fixed bottom)
```

---

## Майбутнє (Одяг)

Outfit overlay — `<img>` поверх персонажа:
```
[character image]
  └── [hat layer]      top: -10%, left: 50%
  └── [glasses layer]  top: 30%,  left: 50%
  └── [scarf layer]    top: 65%,  left: 50%
```
