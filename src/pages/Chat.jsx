import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { suggestAPI } from "../utils/api";
import { formatMessage, getSessionId, saveMessages, loadMessages } from "../utils/chatUtils";
import "./FashionChat.scss";

const Chat = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    // Initialize sessionId immediately if user is available
    if (user?.id) {
      return getSessionId("wardrobe_chat_session", user.id);
    }
    return null;
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const STORAGE_KEY = "wardrobe_chat_messages";
  const SESSION_KEY = "wardrobe_chat_session";

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
      const response = await suggestAPI.getSuggestion(userMessage, currentSessionId);
      console.log("Wardrobe chat response:", response);
      
      if (response.success && response.suggestion) {
        // Handle different response formats
        let rawContent = null;
        if (typeof response.suggestion === 'string') {
          rawContent = response.suggestion;
        } else if (response.suggestion.message) {
          rawContent = response.suggestion.message;
        } else if (response.suggestion.response) {
          rawContent = response.suggestion.response;
        } else if (response.suggestion.text) {
          rawContent = response.suggestion.text;
        } else {
          rawContent = JSON.stringify(response.suggestion);
        }
        
        const formattedContent = formatMessage(rawContent);
        const aiMessage = {
          type: "ai",
          content: formattedContent || "I'm here to help with outfit suggestions from your wardrobe!",
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
      console.error("Chat error:", error);
      const errorMessage = {
        type: "ai",
        content: error.message?.includes("timeout") 
          ? "The request took too long. Please try again."
          : error.message?.includes("Failed to fetch")
          ? "Unable to connect to the server. Please check your internet connection and try again."
          : "I'm having trouble connecting right now. Please check your connection and try again.",
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
          <h2>Chat with Wardrobe</h2>
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
            <h1>Chat with Wardrobe</h1>
            <p>Get personalized outfit suggestions based on your uploaded wardrobe items</p>
            <div className="suggestions">
              <button onClick={() => setInputMessage("What should I wear for a casual dinner?")}>
                What should I wear for a casual dinner?
              </button>
              <button onClick={() => setInputMessage("Suggest an outfit for a date")}>
                Suggest an outfit for a date
              </button>
              <button onClick={() => setInputMessage("What can I wear to work?")}>
                What can I wear to work?
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
                placeholder="Ask for outfit suggestions from your wardrobe..."
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
          <p className="input-hint">Wardrobe Chat uses your uploaded items to suggest outfits.</p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
