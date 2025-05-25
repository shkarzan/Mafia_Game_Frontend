import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="overlay">
        <h1 className="title">MAFIA GAME</h1>
        <div className="button-group">
          <button className="primary-btn" onClick={() => navigate("/join")}>
            Join Game
          </button>
          <button className="secondary-btn" onClick={() => navigate("/create")}>
            Host Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
