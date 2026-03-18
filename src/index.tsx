import React from "react";
import ReactDOM from "react-dom/client";
import {
  FluentProvider,
  webDarkTheme,
  webLightTheme,
} from "@fluentui/react-components";
import App from "./App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
root.render(
  <React.StrictMode>
    <FluentProvider theme={prefersDark ? webDarkTheme : webLightTheme}>
      <App />
    </FluentProvider>
  </React.StrictMode>,
);
