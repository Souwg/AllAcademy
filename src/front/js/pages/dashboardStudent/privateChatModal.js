import React, { useState, useContext } from "react";
import { Context } from "../../store/appContext";
import "../../../styles/chatModal.css";

export const PrivateChatModal = ({ chatUser, initialMessages, onClose }) => {
  const { actions } = useContext(Context);
  const [messages, setMessages] = useState(initialMessages || []);
  const [content, setContent] = useState("");

  const userId = JSON.parse(localStorage.getItem("user")).id;

  const handleSend = async () => {
    if (content.trim() === "") return;

    const newMessage = await actions.postPrivateChat(chatUser.id, content);
    if (newMessage) {
      setMessages((prev) => [...prev, newMessage]);
    }
    setContent("");
  };
  return (
    <div className="chat-modal-overlay">
      <div className="chat-modal">
        {/* 🟡 HEADER */}
        <div className="chat-header">
          <h5>
            <i className="fa-regular fa-comments"></i> Chat with{" "}
            {chatUser.first_name || chatUser.name}
          </h5>
          <i className="fa-solid fa-xmark" onClick={onClose}></i>
        </div>

        {/* 🟢 BODY */}
        <div className="chat-body">
          {messages.length === 0 ? (
            <div className="text-center text-muted">
              No messages yet. Start the conversation 👋
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`chat-message ${
                  m.sender_id === userId ? "own" : "other"
                }`}
              >
                {m.sender_id !== userId && (
                  <strong>{chatUser.first_name || chatUser.name}</strong>
                )}
                <span>{m.content}</span>
              </div>
            ))
          )}
        </div>

        {/* 📝 INPUT */}
        <div className="chat-input-area">
          <input
            type="text"
            className="form-control"
            placeholder="Type a message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button className="btn btn-primary" onClick={handleSend}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
