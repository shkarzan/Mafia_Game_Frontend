import React, { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import "./GamePage.css";
import { useParams, useNavigate } from "react-router-dom";
import api from "../AxiosInstance";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";

const HostPage = () => {
  const navigate = useNavigate();
  const { gameCode } = useParams();
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
  const [clueIn, setClueIn] = useState("");
  const [players, setPlayers] = useState([]);
  const [active, setActive] = useState(true);
  const [gameState, setGameState] = useState(true);

  const checkAuthentication = async () => {
    try {
      const res = await api.get(`/game/${gameCode}/getHost`);
      if (res.data !== sessionStorage.getItem("username")) {
        toast.error("You are not the host");
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!active) {
    toast.success("You deleted the room");
    setTimeout(() => navigate("/"), 2000);
  }

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

  useEffect(() => {
    checkAuthentication();
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

        client.current.subscribe(`/topic/mafia/${gameCode}`, (message) => {
          const msg = JSON.parse(message.body);
          setMafiaMessages((prev) => [...prev, msg]);
        });

        client.current.subscribe(`/topic/police/${gameCode}`, (message) => {
          const msg = JSON.parse(message.body);
          setPoliceMessages((prev) => [...prev, msg]);
        });

        client.current.subscribe(`/topic/doctor/${gameCode}`, (message) => {
          const msg = JSON.parse(message.body);
          setDoctorMessages((prev) => [...prev, msg]);
        });
      },
    });

    client.current.activate();
    return () => {
      client.current.deactivate();
    };
  }, []);

  const sendGeneralMessage = () => {
    if (!generalInput.trim()) return;
    client.current.publish({
      destination: "/app/chat/general",
      body: JSON.stringify({
        sender: "HOST",
        text: generalInput.trim(),
        type: "GENERAL",
        gameCode: gameCode,
      }),
    });
    setGeneralInput("");
  };

  const handleSetClue = async () => {
    try {
      const res = await api.post(`/game/${gameCode}/setClue?clue=${clueIn}`);
      setClue(res.data);
      setClueIn("");
    } catch (error) {}
  };

  const sendMafiaMessage = () => {
    if (!mafiaInput.trim()) return;
    client.current.publish({
      destination: "/app/chat/mafia",
      body: JSON.stringify({
        sender: "HOST",
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
        sender: "HOST",
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
        sender: "HOST",
        text: doctorInput.trim(),
        type: "DOCTOR",
        gameCode: gameCode,
      }),
    });
    setDoctorInput("");
  };

  const changeState = async () => {
    try {
      await api.post(`/game/${gameCode}/nextPhase`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="game-page">
      <Sidebar
        players={players}
        currentUserRole={"Host"}
        gameCode={gameCode}
        loadGame={loadGame}
        setPlayers={setPlayers}
        gameState={gameState}
      />
      <div className="chat-section">
        <div style={{ textAlign: "center", margin: "20px", fontSize: "30px" }}>
          <p>
            Game State - {gameState}{" "}
            <button onClick={changeState}>Change State</button>
          </p>
          <p>Clue - {clue}</p>
          <div>
            <input
              style={{ margin: "20px", fontSize: "20px" }}
              value={clueIn}
              onChange={(e) => setClueIn(e.target.value)}
            />
            <button onClick={handleSetClue}>Set Clue</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          <ChatBox
            title="General Chat"
            messages={generalMessages}
            input={generalInput}
            setInput={setGeneralInput}
            sendMessage={sendGeneralMessage}
            canText={true}
          />

          <ChatBox
            title="Mafia Chat"
            messages={mafiaMessages}
            input={mafiaInput}
            setInput={setMafiaInput}
            sendMessage={sendMafiaMessage}
            canText={true}
          />

          <ChatBox
            title="Police Chat"
            messages={policeMessages}
            input={policeInput}
            setInput={setPoliceInput}
            sendMessage={sendPoliceMessage}
            canText={true}
          />

          <ChatBox
            title="Doctor Chat"
            messages={doctorMessages}
            input={doctorInput}
            setInput={setDoctorInput}
            sendMessage={sendDoctorMessage}
            canText={true}
          />
        </div>
      </div>
    </div>
  );
};

export default HostPage;
