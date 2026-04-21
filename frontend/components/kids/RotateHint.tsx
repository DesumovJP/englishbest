export default function RotateHint() {
  return (
    <div
      aria-hidden
      className="hidden max-sm:landscape:flex fixed inset-0 z-[100] flex-col items-center justify-center gap-4 bg-white text-center px-8"
    >
      <span className="text-6xl animate-[float_3s_ease-in-out_infinite]">📱</span>
      <p className="font-black text-xl text-ink">Поверни телефон</p>
      <p className="font-semibold text-sm text-ink-muted max-w-[280px]">
        Ця сторінка працює у вертикальному режимі. Поверни екран, щоб продовжити.
      </p>
    </div>
  );
}
