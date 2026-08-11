import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell, FlowShell } from "@/components/layout/AppShell";
import { ThemeProvider } from "@/hooks/useTheme";
import Home from "@/pages/Home";
import GameSearch from "@/pages/GameSearch";
import MatchPlayers from "@/pages/MatchPlayers";
import MatchScore from "@/pages/MatchScore";
import MatchRanking from "@/pages/MatchRanking";
import History from "@/pages/History";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route element={<FlowShell />}>
            <Route path="/games/search" element={<GameSearch />} />
            <Route path="/match/:matchId/players" element={<MatchPlayers />} />
            <Route path="/match/:matchId/score" element={<MatchScore />} />
            <Route path="/match/:matchId/ranking" element={<MatchRanking />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
