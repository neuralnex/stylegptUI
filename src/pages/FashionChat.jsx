import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fashionChatAPI } from "../utils/api";
import { PrimaryBtn } from "../components/Btn";
import "./FashionChat.scss";

const FashionChat = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`fashion_session_${user?.id || Date.now()}`);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    // Add user message
    const newUserMessage = {
      type: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setLoading(true);

    try {
      const response = await fashionChatAPI.sendMessage(userMessage, sessionId);
      if (response && (response.message || response.response)) {
        const aiMessage = {
          type: "ai",
          content: response.message || response.response || "I'm here to help with fashion advice!",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          type: "ai",
          content: "Sorry, I couldn't process your request. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        type: "ai",
        content: error.message || "An error occurred. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      // Refocus input after sending
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fashion-chat-page">
      <div className="chat-top-bar">
        <div className="top-bar-content">
          <h2>Fashion Chat</h2>
          <div className="top-bar-actions">
            <span className="user-name">{user?.name}</span>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="empty-state">
            <h1>Fashion Chat</h1>
            <p>Ask me anything about fashion, style, and clothing!</p>
            <div className="suggestions">
              <button onClick={() => setInputMessage("What colors go well together?")}>
                What colors go well together?
              </button>
              <button onClick={() => setInputMessage("How do I style a blazer?")}>
                How do I style a blazer?
              </button>
              <button onClick={() => setInputMessage("What should I wear for a job interview?")}>
                What should I wear for a job interview?
              </button>
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.type}`}>
                <div className="message-container">
                  <div className="message-avatar">
                    {msg.type === "user" ? "👤" : "🤖"}
                  </div>
                  <div className="message-content-wrapper">
                    <div className="message-content">
                      {msg.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message-wrapper ai">
                <div className="message-container">
                  <div className="message-avatar">🤖</div>
                  <div className="message-content-wrapper">
                    <div className="message-content loading">
                      <span className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="input-area">
        <div className="chat-input-form">
          <form onSubmit={handleSend}>
            <div className="input-wrapper">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Message Fashion Chat..."
                disabled={loading}
                autoFocus
              />
              <button
                type="submit"
                className="send-button"
                disabled={loading || !inputMessage.trim()}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </form>
          <p className="input-hint">Fashion Chat can make mistakes. Check important info.</p>
        </div>
      </div>
    </div>
  );
};

export default FashionChat;
