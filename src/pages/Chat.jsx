import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { suggestAPI, fashionChatAPI, avatarAPI } from "../utils/api";
import { formatMessage, getSessionId, saveMessages, loadMessages } from "../utils/chatUtils";
import { Button, Card, CardBody, CardHeader, Image, Avatar, Input, Switch } from "@heroui/react";
import { Link as RouterLink } from "react-router-dom";
import "./FashionChat.scss";

const Chat = ({ initialMode = "wardrobe" }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const fileInputRef = useRef(null);
  const [useWardrobeMode, setUseWardrobeMode] = useState(initialMode !== "fashion");
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const aiAvatar = "/logo.png";
  const userAvatar = user?.profilePicture;

  const getStorageKey = (wardrobeMode) =>
    wardrobeMode ? "wardrobe_chat_messages" : "fashion_chat_messages";
  const getSessionKey = (wardrobeMode) =>
    wardrobeMode ? "wardrobe_chat_session" : "fashion_chat_session";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.id) {
      const savedSessionId = getSessionId(getSessionKey(useWardrobeMode), user.id);
      setSessionId(savedSessionId);
      const savedMessages = loadMessages(getStorageKey(useWardrobeMode));
      setMessages(savedMessages.length > 0 ? savedMessages : []);
    }
  }, [isAuthenticated, user, navigate, useWardrobeMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(getStorageKey(useWardrobeMode), messages);
    }
  }, [messages, useWardrobeMode]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;
    
    if (!sessionId && user?.id) {
      const newSessionId = getSessionId(getSessionKey(useWardrobeMode), user.id);
      setSessionId(newSessionId);
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
      let selectedItems = [];
      let avatarWithOutfitUrl = null;

      const stream = useWardrobeMode
        ? suggestAPI.getSuggestionStream(
            userMessage || "What do you see in these images?",
            currentSessionId,
            imageUrls
          )
        : fashionChatAPI.sendMessageStream(
            userMessage || "What do you see in these images?",
            currentSessionId,
            imageUrls
          );

      for await (const data of stream) {
        if (data.type === "chunk" && data.content) {
          fullContent += data.content;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === streamingMessageId
                ? { ...msg, content: fullContent }
                : msg
            )
          );
        } else if (data.type === "done") {
          if (useWardrobeMode) {
            selectedItems = data.selectedItems || [];
            avatarWithOutfitUrl = data.avatarWithOutfitUrl || null;
          }
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

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === streamingMessageId
            ? {
                ...msg,
                content:
                  formattedContent ||
                  (useWardrobeMode
                    ? "I'm here to help with outfit suggestions from your wardrobe!"
                    : "I'm here to help with fashion advice!"),
                selectedItems: useWardrobeMode ? selectedItems : undefined,
                avatarWithOutfitUrl: useWardrobeMode ? avatarWithOutfitUrl : undefined,
                isSuggestion: useWardrobeMode ? selectedItems.length > 0 : false,
                isStreaming: false,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Chat error:", error);
      // Update the streaming message to show error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === streamingMessageId
            ? {
                ...msg,
                content: error.message?.includes("Failed to fetch")
                  ? "Unable to connect to the server. Please check your internet connection and try again."
                  : "I'm having trouble connecting right now. Please check your connection and try again.",
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
      localStorage.removeItem(getStorageKey(useWardrobeMode));
      if (user?.id) {
        const newSessionId = getSessionId(getSessionKey(useWardrobeMode), user.id);
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
          <div className="top-left">
            <RouterLink to="/" className="chat-logo-link">
              <Image src="/logo.png" alt="StyleGPT" className="chat-logo" radius="sm" />
            </RouterLink>
            <h2>{useWardrobeMode ? "Wardrobe Chat" : "Fashion Chat"}</h2>
          </div>
          <div className="top-bar-actions">
            <Button variant="flat" color="secondary" radius="full" onPress={handleClearChat}>
              Clear Chat
            </Button>
            <span className="user-name">{user?.name}</span>
            <Button variant="light" color="primary" radius="full" onPress={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="empty-state">
            <h1>{useWardrobeMode ? "Wardrobe Chat" : "Fashion Chat"}</h1>
            {useWardrobeMode ? (
              <>
                <p>Get personalized outfit suggestions based on your uploaded wardrobe items</p>
                <div className="suggestions">
                  <Button variant="flat" color="secondary" onPress={() => setInputMessage("What should I wear for a casual dinner?")}>
                    What should I wear for a casual dinner?
                  </Button>
                  <Button variant="flat" color="secondary" onPress={() => setInputMessage("Suggest an outfit for a date")}>
                    Suggest an outfit for a date
                  </Button>
                  <Button variant="flat" color="secondary" onPress={() => setInputMessage("What can I wear to work?")}>
                    What can I wear to work?
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p>Ask me anything about fashion, style, and clothing!</p>
                <div className="suggestions">
                  <Button variant="flat" color="secondary" onPress={() => setInputMessage("What colors go well together?")}>
                    What colors go well together?
                  </Button>
                  <Button variant="flat" color="secondary" onPress={() => setInputMessage("How do I style a blazer?")}>
                    How do I style a blazer?
                  </Button>
                  <Button variant="flat" color="secondary" onPress={() => setInputMessage("What should I wear for a job interview?")}>
                    What should I wear for a job interview?
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.type}`}>
                <div className={`message-container ${msg.type === "user" ? "user-container" : "ai-container"}`}>
                  <div className="message-avatar">
                    <Avatar
                      src={msg.type === "user" ? userAvatar : aiAvatar}
                      name={msg.type === "user" ? user?.name || "You" : "StyleGPT"}
                      color={msg.type === "user" ? "secondary" : "primary"}
                      size="md"
                    />
                  </div>
                  <div className="message-content-wrapper">
                    {msg.images && msg.images.length > 0 && (
                      <div className="message-images">
                        {msg.images.map((imgUrl, imgIndex) => (
                          <Image
                            key={imgIndex}
                            src={imgUrl}
                            alt={`Uploaded ${imgIndex + 1}`}
                            radius="md"
                            className="message-image"
                          />
                        ))}
                      </div>
                    )}
                    <div className="message-content">
                      {msg.content}
                    </div>
                    {useWardrobeMode && msg.type === "ai" && msg.avatarWithOutfitUrl && (
                      <div className="avatar-outfit-preview">
                        <h4>Your Outfit Preview</h4>
                        <div className="avatar-3d-container">
                          <iframe
                            src={msg.avatarWithOutfitUrl}
                            title="Avatar with Outfit"
                            style={{
                              width: "100%",
                              height: "400px",
                              border: "none",
                              borderRadius: "8px",
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {useWardrobeMode && msg.type === "ai" && msg.selectedItems && msg.selectedItems.length > 0 && (
                      <div className="selected-items">
                        <h4>Selected Items</h4>
                        <div className="items-grid">
                          {msg.selectedItems.map((item, itemIndex) => (
                            <div key={itemIndex} className="item-card">
                              <Image
                                src={item.processedImageUrl || item.imageUrl}
                                alt={item.category}
                                radius="md"
                                onError={(e) => {
                                  if (item.imageUrl) {
                                    e.currentTarget.src = item.imageUrl;
                                  }
                                }}
                                className="item-image"
                              />
                              <div className="item-info">
                                <span className="item-category">{item.category}</span>
                                <span className="item-style">{item.style}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {!msg.avatarWithOutfitUrl && (
                          <button 
                            className="try-on-avatar-btn"
                            onClick={async () => {
                              if (loading) return;
                              try {
                                const assetIds = msg.selectedItems
                                  .map(item => item.readyPlayerMeAssetId)
                                  .filter(id => id !== null && id !== undefined);
                                
                                if (assetIds.length === 0) {
                                  alert("Selected items don't have Ready Player Me assets yet. Please wait for assets to be created.");
                                  return;
                                }

                                const response = await avatarAPI.tryOnAvatar(assetIds, "medium");
                                if (response.success && response.avatarUrl) {
                                  setMessages((prev) =>
                                    prev.map((m) =>
                                      m.id === msg.id
                                        ? { ...m, avatarWithOutfitUrl: response.avatarUrl }
                                        : m
                                    )
                                  );
                                } else {
                                  alert(response.error || "Failed to load avatar with outfit");
                                }
                              } catch (error) {
                                console.error("Failed to get avatar:", error);
                                alert("Failed to load avatar. Please make sure you have created an avatar in your profile.");
                              }
                            }}
                          >
                            👤 Try on Avatar
                          </button>
                        )}
                      </div>
                    )}
                    {useWardrobeMode && msg.type === "ai" && msg.selectedItems && msg.selectedItems.length > 0 && (
                      <Button
                        className="suggest-another-btn"
                        color="primary"
                        variant="flat"
                        radius="full"
                        onPress={async () => {
                          if (loading) return;
                          const suggestMessage = "Suggest another outfit";
                          setInputMessage("");
                          
                          const newUserMessage = {
                            type: "user",
                            content: suggestMessage,
                            timestamp: new Date(),
                          };
                          setMessages((prev) => {
                            const filtered = prev.filter(m => !m.isSuggestion);
                            return [...filtered, newUserMessage];
                          });
                          setLoading(true);

                          try {
                            const response = await suggestAPI.getSuggestion(suggestMessage, sessionId, null);
                            
                            if (response.success && response.suggestion) {
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
                              
                              let formattedContent = formatMessage(rawContent);
                              
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
                              
                              const aiMessage = {
                                type: "ai",
                                content: formattedContent || "I'm here to help with outfit suggestions from your wardrobe!",
                                selectedItems: response.selectedItems || [],
                                isSuggestion: true,
                                timestamp: new Date(),
                              };
                              setMessages((prev) => {
                                const filtered = prev.filter(m => !m.isSuggestion);
                                return [...filtered, aiMessage];
                              });
                            }
                          } catch (error) {
                            console.error("Chat error:", error);
                            const errorMessage = {
                              type: "ai",
                              content: error.message?.includes("Failed to fetch")
                                ? "Unable to connect to the server. Please check your internet connection and try again."
                                : "I'm having trouble connecting right now. Please check your connection and try again.",
                              timestamp: new Date(),
                            };
                            setMessages((prev) => [...prev, errorMessage]);
                          } finally {
                            setLoading(false);
                          }
                        }}
                        isDisabled={loading}
                      >
                        Suggest Another Outfit
                      </Button>
                    )}
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
        <div className="input-top-row">
          <Switch
            isSelected={useWardrobeMode}
            onValueChange={setUseWardrobeMode}
            color="primary"
          >
            Use Wardrobe
          </Switch>
        </div>
        <div className="chat-input-form">
          {selectedImages.length > 0 && (
            <div className="selected-images-preview">
              {selectedImages.map((img, index) => (
                <div key={index} className="image-preview-item">
                  <Image src={img.url} alt={img.name} radius="md" />
                  <Button
                    type="button"
                    color="danger"
                    variant="light"
                    className="remove-image-btn"
                    onPress={() => removeImage(index)}
                    aria-label="Remove image"
                    size="sm"
                    isIconOnly
                  >
                    ×
                  </Button>
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
                id="image-upload"
              />
              <Button
                as="label"
                htmlFor="image-upload"
                isIconOnly
                variant="flat"
                color="secondary"
                radius="full"
                title="Upload images"
              >
                📷
              </Button>
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  useWardrobeMode
                    ? "Ask for outfit suggestions from your wardrobe..."
                    : "Message Fashion Chat..."
                }
                isDisabled={loading}
                fullWidth
                variant="bordered"
                radius="lg"
              />
              <Button
                type="submit"
                color="primary"
                variant="solid"
                isIconOnly
                radius="full"
                isDisabled={loading || (!inputMessage.trim() && selectedImages.length === 0)}
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
              </Button>
            </div>
          </form>
          <p className="input-hint">
            {useWardrobeMode
              ? "Wardrobe Chat uses your uploaded items to suggest outfits. You can also upload images!"
              : "Fashion Chat can make mistakes. Check important info. You can also upload images!"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
