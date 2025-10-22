import React, { useEffect, useState, useContext, useRef } from "react";
import { Context } from "../../store/appContext";
import "../../../styles/chatModal.css";

export const CourseChatModal = ({
  show,
  onClose,
  course,
  selectedScheduleId, // 👈 nuevo prop
  onGroupChange,
  originalScheduleId,
  role,
}) => {
  const { store, actions } = useContext(Context);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [highlightedOnce, setHighlightedOnce] = useState(false);

  const currentUserId = store.user?.id;

  useEffect(() => {
    if (
      show &&
      course?.scrollToMessageId &&
      messages.length > 0 &&
      chatContainerRef.current &&
      !highlightedOnce
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
          setHighlightedOnce(true);
        }, 100);
      }
    }
  }, [show, course?.scrollToMessageId, messages, highlightedOnce]);

  useEffect(() => {
    // limpia para evitar que se vean mensajes del grupo anterior
    setMessages([]);

    // solo pedimos mensajes si YA hay grupo seleccionado
    if (show && course?.id && selectedScheduleId !== null) {
      actions.getCourseChat(course.id, selectedScheduleId).then(setMessages);
    }
  }, [show, course?.id, selectedScheduleId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    const msg = await actions.postCourseChat(
      course.id,
      newMessage,
      selectedScheduleId
    ); // 👈 también aquí
    if (msg) setMessages([...messages, msg]);
    setNewMessage("");
  };

  if (!show) return null;

  return (
    <div className="chat-modal-overlay">
      <div className="chat-modal glass-effect">
        <div className="chat-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="m-0">
            💬 {course?.title || "Course Chat"}{" "}
            {selectedScheduleId && (
              <span className="text-primary fw-semibold">
                —{" "}
                {
                  course.schedules.find(
                    (sched) => sched.id === selectedScheduleId
                  )?.group_name
                }{" "}
                (
                {course.schedules.find(
                  (sched) => sched.id === selectedScheduleId
                )?.total_students || 0}
                )
              </span>
            )}
          </h5>
          <i className="fa-solid fa-xmark cursor-pointer" onClick={onClose}></i>
        </div>

        <div className="chat-body" ref={chatContainerRef}>
          {messages.length > 0 ? (
            messages.map((msg) => {
              const isOwn = msg.user_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  data-message-id={msg.id}
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
