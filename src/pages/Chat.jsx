import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { suggestAPI } from "../utils/api";
import Header from "../components/Header";
import { PrimaryBtn } from "../components/Btn";
import "./Chat.scss";

const Chat = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`session_${user?.id || Date.now()}`);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      const response = await suggestAPI.getSuggestion(userMessage, sessionId);
      if (response.success) {
        const aiMessage = {
          type: "ai",
          content: response.suggestion?.message || response.suggestion?.response || "I'm here to help with outfit suggestions!",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          type: "ai",
          content: response.error || "Sorry, I couldn't process your request. Please try again.",
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
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="chat-page">
      <Header />
      <div className="chat-container">
        <div className="chat-header">
          <h1>Chat with Wardrobe</h1>
          <p>Get AI-powered outfit suggestions based on your uploaded wardrobe items</p>
        </div>

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              <p>Start a conversation to get personalized outfit suggestions from your wardrobe!</p>
              <p>Try asking: "What should I wear for a casual dinner?" or "Suggest an outfit for a date"</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                <div className="message-content">
                  {msg.content}
                </div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="message ai loading">
              <div className="message-content">Thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={handleSend}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask for outfit suggestions from your wardrobe..."
            disabled={loading}
          />
          <PrimaryBtn type="submit" text="Send" disabled={loading || !inputMessage.trim()} />
        </form>
      </div>
    </div>
  );
};

export default Chat;

