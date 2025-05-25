import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./LobbyPage.css";
import api from "../AxiosInstance";
import { toast } from "react-toastify";

const LobbyPage = () => {
  const navigate = useNavigate();
  const { gameCode } = useParams();
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [mafiaCount, setMafiaCount] = useState(0);
  const [gameStatus, setGameStatus] = useState("Waiting for Players");
  const [gameActive, setGameActive] = useState(false);

  // Fetch the list of players from the backend
  const fetchPlayers = async () => {
    try {
      const response = await api.get(`/game/${gameCode}/players`);
      setPlayers(response.data);

      // Check if the current player is the host (first player in the list)
      if (sessionStorage.getItem("isHost")) {
        setIsHost(true);
      }

      // Update game status
      if (response.data.length >= 8) {
        setGameStatus("Ready to Start");
      }
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  if (gameActive && !isHost) {
    toast.success("Game is starting | Assigning roles");
    setTimeout(() => {
      navigate(`/game/${gameCode}`);
    }, 2000);
  }

  const checkIfGameStarted = async () => {
    try {
      const res = await api.get(`/game/${gameCode}`);
      if (res.data.active && !isHost) {
        const role = await api.get(
          `/game/${gameCode}/getPlayerRole/${sessionStorage.getItem("id")}`
        );
        sessionStorage.setItem("role", role.data);
        setGameActive(res.data.active);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkAuthentication = () => {
    if (sessionStorage.getItem("isHost")) return true;
    if (
      !sessionStorage.getItem("username") ||
      !sessionStorage.getItem("id") ||
      sessionStorage.getItem("gameCode") !== gameCode
    ) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (checkAuthentication()) {
      fetchPlayers();
      checkIfGameStarted();
      const interval1 = setInterval(fetchPlayers, 5000); // Polling every 5 seconds
      const interval2 = setInterval(checkIfGameStarted, 5000); // Polling every 5 seconds
      return () => clearInterval(interval2, interval1);
    } else {
      toast.error("You can't enter this game");
      setTimeout(() => {
        navigate("/join");
      }, 2000);
    }
  }, []);

  // Start the game (host only action)
  const handleStartGame = async () => {
    try {
      if (mafiaCount !== 0) {
        await api.post(`/game/${gameCode}/start?mafiaCount=${mafiaCount}`);
        setGameActive(true);
        navigate(`/host/${gameCode}`);
      } else toast.error("Number of Mafias should be greater than 0");
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

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
        navigate("/join");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="lobby-container">
      <h2>Lobby - Game Code: {gameCode}</h2>
      <h3>Game Status: {gameStatus}</h3>

      <ul className="player-list">
        {players.map((player) => (
          <li key={player.id}>
            {player.id} - {player.username}{" "}
            <p>
              {sessionStorage.getItem("username") === player.username
                ? "You"
                : ""}
            </p>
          </li>
        ))}
      </ul>

      {isHost && (
        <input
          type="number"
          value={mafiaCount}
          onChange={(e) => setMafiaCount(e.target.value)}
        />
      )}
      {isHost && gameStatus === "Ready to Start" && (
        <button className="start-button" onClick={handleStartGame}>
          Start Game
        </button>
      )}
      <button disabled={isHost} onClick={handleExitRoom}>
        Exit Button
      </button>
      <button disabled={!isHost} onClick={handleDeleteRoom}>
        Delete Room
      </button>
    </div>
  );
};

export default LobbyPage;
