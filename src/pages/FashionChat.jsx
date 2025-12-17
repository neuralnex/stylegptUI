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
  const [selectedImages, setSelectedImages] = useState([]);
  const fileInputRef = useRef(null);
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

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const imagePromises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            file,
            url: event.target.result,
            name: file.name,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then((images) => {
      setSelectedImages((prev) => [...prev, ...images]);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const convertImagesToUrls = () => {
    return selectedImages.map((img) => img.url);
  };

  const handleSendWithSession = async (e, currentSessionId) => {
    if (e) e.preventDefault();

    const userMessage = inputMessage.trim();
    if (!userMessage && selectedImages.length === 0) return;
    
    const imageUrls = convertImagesToUrls();
    setInputMessage("");
    setSelectedImages([]);

    // Add user message
    const newUserMessage = {
      type: "user",
      content: userMessage || "Sent images",
      images: imageUrls,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setLoading(true);

    // Add placeholder AI message for streaming
    const streamingMessageId = Date.now();
    setMessages((prev) => [...prev, {
      id: streamingMessageId,
      type: "ai",
      content: "",
      isStreaming: true,
      timestamp: new Date(),
    }]);

    try {
      let fullContent = "";

      // Use streaming API
      for await (const data of fashionChatAPI.sendMessageStream(
        userMessage || "What do you see in these images?",
        currentSessionId,
        imageUrls
      )) {
        if (data.type === "chunk" && data.content) {
          fullContent += data.content;
          // Update the streaming message
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === streamingMessageId
                ? { ...msg, content: fullContent }
                : msg
            )
          );
        } else if (data.type === "done") {
          // Stream complete
        } else if (data.type === "error") {
          throw new Error(data.message);
        }
      }

      // Format and finalize the message
      let formattedContent = formatMessage(fullContent);
      
      // Cleanup trailing corrupted text
      const sentences = formattedContent.split(/[.!?]\s+/);
      if (sentences.length > 1) {
        const lastSentence = sentences[sentences.length - 1];
        if (lastSentence.length < 5 || /^[a-z]+$/.test(lastSentence.trim())) {
          sentences.pop();
          formattedContent = sentences.join(". ").trim();
          if (!formattedContent.endsWith('.') && !formattedContent.endsWith('!') && !formattedContent.endsWith('?')) {
            formattedContent += ".";
          }
        }
      }

      // Update to final message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === streamingMessageId
            ? {
                ...msg,
                content: formattedContent || "I'm here to help with fashion advice!",
                isStreaming: false,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Fashion chat error:", error);
      // Update the streaming message to show error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === streamingMessageId
            ? {
                ...msg,
                content: error.message?.includes("Failed to fetch")
                  ? "Unable to connect to the server. Please check your internet connection and try again."
                  : "I'm having trouble connecting right now. Please try again.",
                isStreaming: false,
              }
            : msg
        )
      );
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
                    {msg.images && msg.images.length > 0 && (
                      <div className="message-images">
                        {msg.images.map((imgUrl, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={imgUrl}
                            alt={`Uploaded ${imgIndex + 1}`}
                            className="message-image"
                          />
                        ))}
                      </div>
                    )}
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
          {selectedImages.length > 0 && (
            <div className="selected-images-preview">
              {selectedImages.map((img, index) => (
                <div key={index} className="image-preview-item">
                  <img src={img.url} alt={img.name} />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => removeImage(index)}
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleSend}>
            <div className="input-wrapper">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                style={{ display: "none" }}
                id="image-upload-fashion"
              />
              <label htmlFor="image-upload-fashion" className="image-upload-btn" title="Upload images">
                📷
              </label>
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
                disabled={loading || (!inputMessage.trim() && selectedImages.length === 0)}
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
          <p className="input-hint">Fashion Chat can make mistakes. Check important info. You can also upload images!</p>
        </div>
      </div>
    </div>
  );
};

export default FashionChat;
