import React from "react";
import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import App from "@/App";
import "@/index.css";
import { ensureSeeded } from "@/lib/db";

ensureSeeded();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    {/* Comptage de visites sans cookies (Vercel Analytics) : aucune donnée
        de partie ne quitte l'appareil, ceci ne mesure que le trafic. */}
    <Analytics />
  </React.StrictMode>
);
