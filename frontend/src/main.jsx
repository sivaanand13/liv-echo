import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.jsx";
import { BrowserRouter } from "react-router";
import firebaseConfig from "./firebase/config.js";
import { initializeApp } from "firebase/app";

initializeApp(firebaseConfig);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
