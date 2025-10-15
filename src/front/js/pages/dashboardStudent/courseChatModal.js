import React, { useEffect, useState, useContext, useRef } from "react";
import { Context } from "../../store/appContext";
import "../../../styles/chatModal.css";

export const CourseChatModal = ({ show, onClose, course }) => {
  const { store, actions } = useContext(Context);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);

  const currentUserId = store.user?.id; // 👈 ID del usuario actual

  useEffect(() => {
    // Si ya vienen mensajes precargados, se muestran de inmediato
    if (course?.messages) {
      setMessages(course.messages);
    }

    // 👇 Luego haces un fetch por si hay mensajes nuevos (background update)
    if (show && course?.id) {
      actions.getCourseChat(course.id).then(setMessages);
    }
  }, [show, course]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    const msg = await actions.postCourseChat(course.id, newMessage);
    if (msg) setMessages([...messages, msg]);
    setNewMessage("");
  };

  if (!show) return null;

  return (
    <div className="chat-modal-overlay">
      <div className="chat-modal glass-effect">
        <div className="chat-header">
          <h5>💬 {course?.title || "Course Chat"}</h5>
          <i className="fa-solid fa-xmark" onClick={onClose}></i>
        </div>

        <div className="chat-body">
          {messages.length > 0 ? (
            messages.map((msg) => {
              const isOwn = msg.user_id === currentUserId; // 👈 Verifica si es tuyo
              return (
                <div
                  key={msg.id}
                  className={`chat-message ${isOwn ? "own" : "other"}`}
                >
                  {!isOwn && <strong>{msg.user_name}:</strong>}
                  <span>{msg.content}</span>
                </div>
              );
            })
          ) : (
            <p className="text-muted text-center">No messages yet.</p>
          )}
          <div ref={chatEndRef}></div>
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            className="form-control"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button className="btn btn-primary ms-2" onClick={handleSend}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
