export interface InfoPopoverItem {
  label: string;
  value: string;
  danger?: boolean;
}

export function InfoPopover({ items }: { items: InfoPopoverItem[] }) {
  return (
    <div className="relative group inline-flex items-center">
      {/* Trigger icon */}
      <button
        type="button"
        aria-label="Показати статистику"
        className="w-4 h-4 rounded-full border border-border flex items-center justify-center text-[9px] font-black text-ink-muted hover:border-ink-muted hover:text-ink transition-colors leading-none"
      >
        i
      </button>

      {/* Popover */}
      <div className="absolute left-0 top-full mt-2 z-30 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none group-hover:pointer-events-auto">
        <div className="bg-white rounded-xl border border-border shadow-lg px-3 py-2.5 min-w-[210px]">
          <ul className="flex flex-col divide-y divide-border">
            {items.map((item, i) => (
              <li key={i} className="flex items-center justify-between gap-6 py-1.5 first:pt-0 last:pb-0">
                <span className="text-xs text-ink-muted">{item.label}</span>
                <span className={`text-xs font-bold tabular-nums ${item.danger ? 'text-danger' : 'text-ink'}`}>
                  {item.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
