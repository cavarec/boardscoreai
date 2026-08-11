import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/", label: "Accueil", icon: HomeIcon },
  { to: "/history", label: "Historique", icon: HistoryIcon },
  { to: "/tools", label: "Outils", icon: ToolsIcon },
  { to: "/settings", label: "Réglages", icon: SettingsIcon },
];

export function BottomNav() {
  return (
    <nav className="safe-bottom sticky bottom-0 z-10 border-t border-line bg-paper-raised">
      <ul className="mx-auto flex max-w-xl justify-between px-2">
        {TABS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[0.68rem] font-medium ${
                  isActive ? "text-felt-strong" : "text-ink-faint"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 11.5 12 5l8 6.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v8a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function HistoryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ToolsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path
        d="M14.5 6.5a3.5 3.5 0 0 0-4.6 4.1L4 16.5V20h3.5l5.9-5.9a3.5 3.5 0 0 0 4.1-4.6l-2.6 2.6-2-2 2.6-2.6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.1-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2.1 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9c.6.5 1.3.9 2.1 1.2L10 21h4l.5-2.6a7 7 0 0 0 2.1-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
