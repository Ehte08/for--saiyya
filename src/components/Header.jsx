import React from "react";

export default function Header({ onNavigate }) {
  return (
    <nav id="header">
      <div className="title">
        <button type="button" id="her-name" onClick={() => onNavigate("home")}>
          Saira
        </button>
      </div>

      <div className="navbar">
        <button type="button" onClick={() => onNavigate("home")}>Home</button>
        <button type="button" onClick={() => onNavigate("notes")}>Notes</button>
        <button type="button" onClick={() => onNavigate("movies")}>Movies</button>
        <button type="button" onClick={() => onNavigate("music")}>Music</button>
      </div>
    </nav>
  );
}
