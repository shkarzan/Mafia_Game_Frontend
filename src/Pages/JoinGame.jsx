import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CreateGame.css";
import api from "../AxiosInstance";
import { toast } from "react-toastify";

const JoinGame = () => {
  const [gameCode, setGameCode] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleJoinGame = async () => {
    try {
      const res = await api.post(
        `/game/${gameCode}/join?username=${username}`,
        null
      );
      toast.success("Joining");
      setTimeout(() => {
        sessionStorage.setItem("username", res.data.username);
        sessionStorage.setItem("id", res.data.id);
        sessionStorage.setItem("gameCode", res.data.gameCode);
        navigate(`/lobby/${gameCode}`);
      }, 3000);
    } catch (error) {
      if (error.status == 400) {
        toast.error("Username already taken");
      }
      console.error("Error joining game:", error);
    }
  };

  return (
    <div className="create-join-container">
      <div className="overlay">
        <h1 className="title">Join a Game</h1>
        <input
          type="text"
          placeholder="Enter Game Code"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Enter Your Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input-field"
        />
        <button className="primary-btn" onClick={handleJoinGame}>
          Join Game
        </button>
      </div>
    </div>
  );
};

export default JoinGame;
