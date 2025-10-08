import React, { useEffect, useState, useContext, useRef } from "react";
import { Context } from "../../store/appContext";
import "../../../styles/studentChatModal.css";

export const StudentChatModal = ({ show, onClose, course }) => {
  const { actions } = useContext(Context);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);

  // Cargar mensajes al abrir el modal
  useEffect(() => {
    if (show && course?.id) {
      actions.getCourseChat(course.id).then(setMessages);
    }
  }, [show, course]);

  // Scroll automático al final
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
            messages.map((msg) => (
              <div key={msg.id} className="chat-message">
                <strong>{msg.user_name}: </strong>
                <span>{msg.content}</span>
              </div>
            ))
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
