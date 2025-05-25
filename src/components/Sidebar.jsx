import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../AxiosInstance";

const Sidebar = ({
  players,
  currentUserRole,
  gameCode,
  setPlayers,
  gameState,
}) => {
  const isHost = sessionStorage.getItem("isHost") ? true : false;
  const killUser = async (id, username, alive) => {
    if (gameState == "NIGHT") {
      const res = await api.post(`/game/${gameCode}/${id}?action=KILL`);
      setPlayers(res.data);
      toast.success(username + " is killed");
    } else if (!alive) {
      toast.error("The user is already killed");
    } else {
      toast.error("You cant kill now");
    }
  };
  const reviveUser = async (id, username, alive) => {
    if (gameState === "DAY") {
      const res = await api.post(`/game/${gameCode}/${id}?action=SAVE`);
      setPlayers(res.data);
      toast.success(username + " is saved");
    } else if (alive) {
      toast.error("The user is not dead");
    } else {
      toast.error("You cant revive now");
    }
  };
  const navigate = useNavigate();

  const handleDeleteRoom = async () => {
    try {
      const res = await api.delete(`/game/${gameCode}`);
      toast.success(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleExitRoom = async () => {
    try {
      if (sessionStorage.getItem("id")) {
        const id = sessionStorage.getItem("id");
        await api.delete(`/game/${gameCode}/${id}`);
        sessionStorage.removeItem("id");
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("gameCode");
        sessionStorage.removeItem("role");
        navigate("/");
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="sidebar">
      <h2>Players</h2>
      <ul className="player-list">
        {players.map((p, idx) => (
          <li key={idx} style={{ padding: isHost ? "10px" : "20px" }}>
            {currentUserRole == "Mafia" && (
              <p
                style={{
                  color: p.role == "Mafia" ? "red" : "",
                  textDecoration: p.alive ? "" : "line-through",
                }}
              >
                {p.username + " "}
                {sessionStorage.getItem("username") === p.username
                  ? "You -" + p.role
                  : ""}
              </p>
            )}
            {isHost && (
              <p
                style={{
                  color: p.role == "Mafia" ? "red" : "",
                  margin: "20px",
                  textDecoration: p.alive ? "" : "line-through",
                }}
              >
                {p.id + " "}
                {p.username + " "}
                {sessionStorage.getItem("username") === p.username ? "You" : ""}
                {" " + p.role}
              </p>
            )}
            {currentUserRole !== "Mafia" && !isHost && (
              <p
                style={{
                  //   color: p.role == "Mafia" ? "red" : "",
                  textDecoration: p.alive ? "" : "line-through",
                }}
              >
                {p.username + " "}
                {sessionStorage.getItem("username") === p.username
                  ? "You-" + p.role
                  : ""}
              </p>
            )}
            <div>
              <button
                hidden={!isHost}
                className="action-btn"
                onClick={() => killUser(p.id, p.username, p.alive)}
              >
                Kill
              </button>
              <button
                hidden={!isHost}
                className="action-btn"
                onClick={() => reviveUser(p.id, p.username, p.alive)}
              >
                Save
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button hidden={isHost} onClick={handleExitRoom}>
        Exit Game
      </button>
      <button hidden={!isHost} onClick={handleDeleteRoom}>
        Delete Room button
      </button>
    </div>
  );
};

export default Sidebar;
