import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import "@/index.css";
import { ensureSeeded } from "@/lib/db";
import { pullBarcodeMap, pullGameCatalog } from "@/lib/sync";

ensureSeeded().then(() => {
  // Best-effort, jamais bloquant (voir canSync) : c'est ce qui redescend les
  // codes-barres appris par les autres appareils, et tient le catalogue à
  // jour si de nouveaux jeux sont approuvés côté communauté plus tard.
  void pullGameCatalog();
  void pullBarcodeMap();
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
