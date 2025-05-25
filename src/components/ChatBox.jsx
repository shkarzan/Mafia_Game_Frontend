import React from "react";

const ChatBox = ({
  title,
  messages,
  input,
  setInput,
  sendMessage,
  canText,
}) => {
  return (
    <div className="chat-box">
      <h2>{title}</h2>
      <div className="messages">
        {messages.map((msg, idx) => (
          <p key={idx}>
            <b>{msg.sender}:</b> {msg.text}
          </p>
        ))}
      </div>
      <input
        hidden={!canText}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={`Type a message...`}
        className="chat-input"
      />
      <button hidden={!canText} onClick={sendMessage} className="send-btn">
        Send
      </button>
    </div>
  );
};

export default ChatBox;
