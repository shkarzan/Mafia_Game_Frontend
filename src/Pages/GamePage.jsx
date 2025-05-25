import React, { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import "./GamePage.css";
import { useParams, useNavigate } from "react-router-dom";
import api from "../AxiosInstance";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";

const GamePage = () => {
  const navigate = useNavigate();
  const { gameCode } = useParams();
  const currentUser = sessionStorage.getItem("username");
  const currentRole = sessionStorage.getItem("role");
  const [generalMessages, setGeneralMessages] = useState([]);
  const [mafiaMessages, setMafiaMessages] = useState([]);
  const [policeMessages, setPoliceMessages] = useState([]);
  const [doctorMessages, setDoctorMessages] = useState([]);
  const [generalInput, setGeneralInput] = useState("");
  const [mafiaInput, setMafiaInput] = useState("");
  const [policeInput, setPoliceInput] = useState("");
  const [doctorInput, setDoctorInput] = useState("");
  const client = useRef(null);
  const [clue, setClue] = useState();
  const [players, setPlayers] = useState([]);
  const [active, setActive] = useState(true);
  const [gameState, setGameState] = useState(true);
  const [canText, setCanText] = useState(true);

  const checkAuthentication = () => {
    if (
      !sessionStorage.getItem("id") ||
      !sessionStorage.getItem("username") ||
      sessionStorage.getItem("gameCode") !== gameCode ||
      !sessionStorage.getItem("role")
    )
      return false;
    return true;
  };

  const assignRoles = async () => {
    try {
      const res = await api.get(
        `/game/${gameCode}/getPlayerRole/${sessionStorage.getItem("id")}`
      );
      sessionStorage.setItem("role", res.data.role);
      sessionStorage.setItem("gameCode", res.data.gameCode);
      sessionStorage.setItem("id", res.data.id);
      sessionStorage.setItem("username", res.data.username);
    } catch (error) {
      console.log(error);
    }
  };

  const loadGame = async () => {
    try {
      const res = await api.get(`/game/${gameCode}`);
      setGameState(res.data.gameState);
      setActive(res.data.active);
      setPlayers(res.data.players);
      setClue(res.data.clue);
    } catch (error) {
      console.log(error);
    }
  };

  if (!active) {
    sessionStorage.removeItem("id");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("gameCode");
    sessionStorage.removeItem("role");
    toast.error("Game has been ended by the Host");
    setTimeout(() => {
      navigate("/");
    }, 2000);
  }

  useEffect(() => {
    if (checkAuthentication()) {
      assignRoles();
      setInterval(loadGame, 2000);
      client.current = new Client({
        // webSocketFactory: () => socket,
        // brokerURL: "ws://localhost:8080/ws",
        // brokerURL: "ws://192.168.0.104:8080/ws",
        brokerURL: "https://mafia-game-vj08.onrender.com/ws",
        reconnectDelay: 5000,
        onConnect: () => {
          client.current.subscribe(`/topic/general/${gameCode}`, (message) => {
            const msg = JSON.parse(message.body);
            setGeneralMessages((prev) => [...prev, msg]);
          });
          // if (currentRole === "Mafia") {
          client.current.subscribe(`/topic/mafia/${gameCode}`, (message) => {
            const msg = JSON.parse(message.body);
            setMafiaMessages((prev) => [...prev, msg]);
          });
          // }
          // if (currentRole === "Police") {
          client.current.subscribe(`/topic/police/${gameCode}`, (message) => {
            const msg = JSON.parse(message.body);
            setPoliceMessages((prev) => [...prev, msg]);
          });
          // }
          // if (currentRole === "Doctor") {
          client.current.subscribe(`/topic/doctor/${gameCode}`, (message) => {
            const msg = JSON.parse(message.body);
            setDoctorMessages((prev) => [...prev, msg]);
          });
          // }
        },
      });

      client.current.activate();
      return () => {
        client.current.deactivate();
      };
    } else {
      toast.error("You can't join this game");
      setTimeout(() => {
        navigate("/join");
      }, 2000);
    }
  }, []);

  const sendGeneralMessage = () => {
    setCanText(false);
    setTimeout(() => {
      setCanText(true);
    }, 5000);
    if (!generalInput.trim()) return;
    client.current.publish({
      destination: "/app/chat/general",
      body: JSON.stringify({
        sender: currentUser,
        text: generalInput.trim(),
        type: "GENERAL",
        gameCode: gameCode,
      }),
    });
    setGeneralInput("");
  };

  const sendMafiaMessage = () => {
    if (!mafiaInput.trim()) return;
    client.current.publish({
      destination: "/app/chat/mafia",
      body: JSON.stringify({
        sender: currentUser,
        text: mafiaInput.trim(),
        type: "MAFIA",
        gameCode: gameCode,
      }),
    });
    setMafiaInput("");
  };
  const sendPoliceMessage = () => {
    if (!policeInput.trim()) return;
    client.current.publish({
      destination: "/app/chat/police",
      body: JSON.stringify({
        sender: currentUser,
        text: policeInput.trim(),
        type: "POLICE",
        gameCode: gameCode,
      }),
    });
    setPoliceInput("");
  };
  const sendDoctorMessage = () => {
    if (!doctorInput.trim()) return;
    client.current.publish({
      destination: "/app/chat/doctor",
      body: JSON.stringify({
        sender: currentUser,
        text: doctorInput.trim(),
        type: "DOCTOR",
        gameCode: gameCode,
      }),
    });
    setDoctorInput("");
  };

  return (
    <div className="game-page">
      <Sidebar
        players={players}
        currentUserRole={currentRole}
        gameCode={gameCode}
        loadGame={loadGame}
        setPlayers={setPlayers}
        gameState={gameState}
      />
      <div className="chat-section">
        <div style={{ textAlign: "center", margin: "20px", fontSize: "30px" }}>
          <p>Game State - {gameState} </p>
          <p hidden={currentRole === "Mafia"}>Clue - {clue}</p>
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          <ChatBox
            title="General Chat"
            messages={generalMessages}
            input={generalInput}
            setInput={setGeneralInput}
            sendMessage={sendGeneralMessage}
            canText={canText}
          />
          {currentRole === "Mafia" && (
            <ChatBox
              title="Mafia Chat"
              messages={mafiaMessages}
              input={mafiaInput}
              setInput={setMafiaInput}
              sendMessage={sendMafiaMessage}
              canText={true}
            />
          )}
          {currentRole === "Police" && (
            <ChatBox
              title="Police Chat"
              messages={policeMessages}
              input={policeInput}
              setInput={setPoliceInput}
              sendMessage={sendPoliceMessage}
              canText={true}
            />
          )}
          {currentRole === "Doctor" && (
            <ChatBox
              title="Doctor Chat"
              messages={doctorMessages}
              input={doctorInput}
              setInput={setDoctorInput}
              sendMessage={sendDoctorMessage}
              canText={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GamePage;
