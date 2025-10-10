import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import WagmiConfigProvider from "./config/wagmi.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WagmiConfigProvider>
      <App />
    </WagmiConfigProvider>
  </React.StrictMode>
);