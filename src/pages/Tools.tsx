import { Link } from "react-router-dom";
import type { SVGProps } from "react";

const TOOLS: { to: string; label: string; description: string; Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element }[] = [
  { to: "/tools/timer", label: "Minuteur", description: "Compte à rebours avec alarme", Icon: TimerIcon },
  { to: "/tools/dice", label: "Dés", description: "Lance 1 à 6 dés", Icon: DiceIcon },
  { to: "/tools/draw", label: "Tirage au sort", description: "Choisit un nom au hasard", Icon: DrawIcon },
  { to: "/tools/coin", label: "Pile ou face", description: "Décision rapide à deux issues", Icon: CoinIcon },
  { to: "/tools/wheel", label: "Roue de sélection", description: "Tourne une roue d'options", Icon: WheelIcon },
  { to: "/tools/player-clock", label: "Chronomètre par joueur", description: "Temps de réflexion, tour par tour", Icon: ClockIcon },
];

export default function Tools() {
  return (
    <div className="flex flex-col gap-5 px-5 pt-8 pb-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Outils</h1>
        <p className="mt-1 text-ink-soft">Pour la table, sans rapport avec le score.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {TOOLS.map(({ to, label, description, Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col gap-1 rounded-2xl border border-line bg-paper-raised px-4 py-4 active:bg-paper-sunken"
          >
            <Icon className="h-6 w-6 text-felt-strong" aria-hidden="true" />
            <span className="mt-1 font-semibold">{label}</span>
            <span className="text-xs text-ink-faint">{description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function TimerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l3 2M9 2h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DiceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="8.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="15.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function DrawIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M9 6v12M6 9h.01M6 15h.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CoinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WheelIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4v8l6 3M12 4v8L6 15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="8" cy="15" r="5.5" />
      <circle cx="16" cy="9" r="5.5" />
      <path d="M8 12v3l2 1.5M16 6v3l2 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
