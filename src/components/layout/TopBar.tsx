import { useNavigate } from "react-router-dom";

interface TopBarProps {
  title: string;
  onBack?: () => void;
  action?: React.ReactNode;
}

/** Barre utilisée sur les écrans "de parcours" (scan, saisie, classement…),
 * qui sortent de la navigation par onglets du bas. */
export function TopBar({ title, onBack, action }: TopBarProps) {
  const navigate = useNavigate();
  return (
    <header className="safe-top sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-paper-raised px-4 py-3">
      <button
        type="button"
        aria-label="Retour"
        onClick={() => (onBack ? onBack() : navigate(-1))}
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft active:bg-paper-sunken"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <h1 className="flex-1 truncate font-display text-lg font-bold">{title}</h1>
      {action}
    </header>
  );
}
