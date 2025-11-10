import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fashionChatAPI } from "../utils/api";
import { formatMessage, getSessionId, saveMessages, loadMessages } from "../utils/chatUtils";
import "./FashionChat.scss";

const FashionChat = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    // Initialize sessionId immediately if user is available
    if (user?.id) {
      return getSessionId("fashion_chat_session", user.id);
    }
    return null;
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const STORAGE_KEY = "fashion_chat_messages";
  const SESSION_KEY = "fashion_chat_session";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Load session and messages
    if (user?.id) {
      const savedSessionId = getSessionId(SESSION_KEY, user.id);
      setSessionId(savedSessionId);
      const savedMessages = loadMessages(STORAGE_KEY);
      if (savedMessages.length > 0) {
        setMessages(savedMessages);
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Save messages whenever they change
    if (messages.length > 0) {
      saveMessages(STORAGE_KEY, messages);
    }
  }, [messages]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;
    
    // Ensure sessionId is set before sending
    if (!sessionId && user?.id) {
      const newSessionId = getSessionId(SESSION_KEY, user.id);
      setSessionId(newSessionId);
      // Use the new sessionId for this request
      return handleSendWithSession(e, newSessionId);
    }
    
    if (!sessionId) {
      console.error("Session ID not available");
      return;
    }
    
    handleSendWithSession(e, sessionId);
  };

  const handleSendWithSession = async (e, currentSessionId) => {
    if (e) e.preventDefault();

    const userMessage = inputMessage.trim();
    if (!userMessage) return;
    
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
      const response = await fashionChatAPI.sendMessage(userMessage, currentSessionId);
      console.log("Fashion chat response:", response);
      
      // Handle different response formats
      let rawContent = null;
      if (typeof response === 'string') {
        rawContent = response;
      } else if (response?.message) {
        rawContent = response.message;
      } else if (response?.response) {
        rawContent = response.response;
      } else if (response?.text) {
        rawContent = response.text;
      } else if (response) {
        rawContent = JSON.stringify(response);
      }
      
      if (rawContent) {
        const formattedContent = formatMessage(rawContent);
        const aiMessage = {
          type: "ai",
          content: formattedContent || "I'm here to help with fashion advice!",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Fashion chat error:", error);
      const errorMessage = {
        type: "ai",
        content: error.message?.includes("timeout") 
          ? "The request took too long. Please try again."
          : error.message?.includes("Failed to fetch")
          ? "Unable to connect to the server. Please check your internet connection and try again."
          : "I'm having trouble connecting right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear this conversation?")) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
      if (user?.id) {
        const newSessionId = getSessionId(SESSION_KEY, user.id);
        setSessionId(newSessionId);
      }
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
            <button className="clear-btn" onClick={handleClearChat}>
              Clear Chat
            </button>
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
                <div className={`message-container ${msg.type === "user" ? "user-container" : "ai-container"}`}>
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
                <div className="message-container ai-container">
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
