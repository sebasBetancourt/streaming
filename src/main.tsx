import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/app/providers/AuthContext";
import { ShelfProvider } from "@/app/providers/ShelfContext";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ShelfProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ShelfProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
