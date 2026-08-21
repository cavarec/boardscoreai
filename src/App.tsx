import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell, FlowShell } from "@/components/layout/AppShell";
import { ThemeProvider } from "@/hooks/useTheme";
import Home from "@/pages/Home";
import GameSearch from "@/pages/GameSearch";
import MatchPlayers from "@/pages/MatchPlayers";
import MatchScore from "@/pages/MatchScore";
import MatchRanking from "@/pages/MatchRanking";
import History from "@/pages/History";
import Profiles from "@/pages/Profiles";
import Settings from "@/pages/Settings";
import Tools from "@/pages/Tools";
import Timer from "@/pages/tools/Timer";
import Dice from "@/pages/tools/Dice";
import Draw from "@/pages/tools/Draw";
import Coin from "@/pages/tools/Coin";
import Wheel from "@/pages/tools/Wheel";
import PlayerClock from "@/pages/tools/PlayerClock";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route element={<FlowShell />}>
            <Route path="/games/search" element={<GameSearch />} />
            <Route path="/profiles" element={<Profiles />} />
            <Route path="/match/:matchId/players" element={<MatchPlayers />} />
            <Route path="/match/:matchId/score" element={<MatchScore />} />
            <Route path="/match/:matchId/ranking" element={<MatchRanking />} />
            <Route path="/tools/timer" element={<Timer />} />
            <Route path="/tools/dice" element={<Dice />} />
            <Route path="/tools/draw" element={<Draw />} />
            <Route path="/tools/coin" element={<Coin />} />
            <Route path="/tools/wheel" element={<Wheel />} />
            <Route path="/tools/player-clock" element={<PlayerClock />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
