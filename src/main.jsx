import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, useNavigate, useHref } from "react-router-dom";
import { HeroUIProvider } from "@heroui/react";
import App from "./App";
import "./index.scss";

const AppWithProviders = () => {
  const navigate = useNavigate();
  const href = useHref;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark", "bg-background", "text-foreground");
    return () => {
      root.classList.remove("dark", "bg-background", "text-foreground");
    };
  }, []);

  return (
    <HeroUIProvider navigate={navigate} useHref={href}>
      <App />
    </HeroUIProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppWithProviders />
    </BrowserRouter>
  </React.StrictMode>
);
