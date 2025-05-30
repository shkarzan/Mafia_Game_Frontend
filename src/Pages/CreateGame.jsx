import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CreateGame.css";
import api from "../AxiosInstance";
import LoadingIndicator from "../components/LoadingIndicator";

const CreateGame = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCreateGame = async () => {
    setLoading(true);
    try {
      const response = await api.post(
        `/game/create?username=${username}`,
        null
      );
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("isHost", true);
      sessionStorage.setItem("role", "Host");
      navigate(`/lobby/${response.data}`);
    } catch (error) {
      console.error("Error creating game:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-join-container">
      <div className="overlay">
        <h1 className="title">Host a Game</h1>
        <input
          type="text"
          placeholder="Enter Your Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input-field"
        />
        {loading && <LoadingIndicator />}
        <button className="primary-btn" onClick={handleCreateGame}>
          Create Game
        </button>
      </div>
    </div>
  );
};

export default CreateGame;
