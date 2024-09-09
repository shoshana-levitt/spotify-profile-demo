import React from "react";
import ReactDOM from "react-dom/client";
import UserProfile from "./components/UserProfile";
import TopContent from "./components/TopContent";
import "./style.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <UserProfile />
    <TopContent />
  </React.StrictMode>
);
