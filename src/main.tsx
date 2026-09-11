import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";

import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./context/AuthProvider";
import { ThemeProvider } from "./context/ThemeProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "var(--bg-surface-elevated)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-lg)",
          },
        }}
      />
    </ThemeProvider>
  </StrictMode>,
);

