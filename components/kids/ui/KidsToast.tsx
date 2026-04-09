/**
 * KidsToast — slide-up success notification for kids pages.
 * Renders fixed at bottom-center; auto-hides via parent state.
 *
 * Usage:
 *   const [toast, setToast] = useState<string | null>(null);
 *   // trigger:
 *   setToast("🎉 Куплено!"); setTimeout(() => setToast(null), 2500);
 *   // render:
 *   <KidsToast message={toast} />
 */

interface KidsToastProps {
  message: string | null;
}

export function KidsToast({ message }: KidsToastProps) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up whitespace-nowrap">
      <div className="bg-primary text-white text-sm font-black px-6 py-4 rounded-2xl shadow-press-primary">
        {message}
      </div>
    </div>
  );
}
