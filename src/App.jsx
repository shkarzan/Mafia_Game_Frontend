import { useState } from "react";
// import "./App.css";
import { Route, Router, Routes } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import CreateGame from "./Pages/CreateGame";
import JoinGame from "./Pages/JoinGame";
import LobbyPage from "./Pages/LobbyPage";
import GamePage from "./Pages/GamePage";
import HostPage from "./Pages/HostPage";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <LandingPage
            onCreate={() => (window.location.href = "/create")}
            onJoin={() => (window.location.href = "/join")}
          />
        }
      />
      <Route path="/create" element={<CreateGame />} />
      <Route path="/join" element={<JoinGame />} />
      <Route path="/lobby/:gameCode" element={<LobbyPage />} />
      <Route path="/game/:gameCode" element={<GamePage />} />
      <Route path="/host/:gameCode" element={<HostPage />} />
    </Routes>
  );
}

export default App;
