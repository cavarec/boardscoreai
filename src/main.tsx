import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import "@/index.css";
import { ensureSeeded } from "@/lib/db";
import { pullGameCatalog } from "@/lib/sync";

ensureSeeded().then(() => {
  // Best-effort, jamais bloquant (voir canSync) : tient le catalogue à jour
  // si de nouveaux jeux sont approuvés côté communauté plus tard.
  void pullGameCatalog();
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
