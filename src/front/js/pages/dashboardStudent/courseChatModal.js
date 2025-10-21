import React, { useEffect, useState, useContext, useRef } from "react";
import { Context } from "../../store/appContext";
import "../../../styles/chatModal.css";

export const CourseChatModal = ({ show, onClose, course }) => {
  const { store, actions } = useContext(Context);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [highlightedOnce, setHighlightedOnce] = useState(false);

  const currentUserId = store.user?.id; // 👈 ID del usuario actual

  useEffect(() => {
    if (
      show &&
      course?.scrollToMessageId &&
      messages.length > 0 &&
      chatContainerRef.current &&
      !highlightedOnce // 👈 solo si no se ha resaltado ya
    ) {
      const targetElement = chatContainerRef.current.querySelector(
        `[data-message-id="${course.scrollToMessageId}"]`
      );

      if (targetElement) {
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
          targetElement.classList.add("highlighted-message");
          setTimeout(() => {
            targetElement.classList.remove("highlighted-message");
          }, 3000);
          setHighlightedOnce(true); // ✅ lo marcamos como ya resaltado
        }, 100);
      }
    }
  }, [show, course?.scrollToMessageId, messages, highlightedOnce]);

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

        <div className="chat-body" ref={chatContainerRef}>
          {messages.length > 0 ? (
            messages.map((msg) => {
              const isOwn = msg.user_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  data-message-id={msg.id} // 👈 esto es lo nuevo
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
