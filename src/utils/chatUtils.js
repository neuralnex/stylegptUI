// Format AI response to remove markdown and make it smooth
export const formatMessage = (text) => {
  if (!text) return "";
  
  // Remove markdown bold (**text**)
  let formatted = text.replace(/\*\*(.*?)\*\*/g, "$1");
  
  // Remove markdown italic (*text*)
  formatted = formatted.replace(/\*(.*?)\*/g, "$1");
  
  // Remove markdown headers (# Header)
  formatted = formatted.replace(/^#+\s+/gm, "");
  
  // Convert markdown lists to plain text with proper spacing
  formatted = formatted.replace(/^\*\s+/gm, "• ");
  formatted = formatted.replace(/^-\s+/gm, "• ");
  formatted = formatted.replace(/^\d+\.\s+/gm, "");
  
  // Clean up multiple newlines
  formatted = formatted.replace(/\n{3,}/g, "\n\n");
  
  // Trim whitespace
  formatted = formatted.trim();
  
  return formatted;
};

// Get or create session ID
export const getSessionId = (key, userId) => {
  const stored = localStorage.getItem(key);
  if (stored) {
    return stored;
  }
  const newSessionId = `${key}_${userId}_${Date.now()}`;
  localStorage.setItem(key, newSessionId);
  return newSessionId;
};

// Save messages to localStorage
export const saveMessages = (key, messages) => {
  try {
    localStorage.setItem(key, JSON.stringify(messages));
  } catch (error) {
    console.error("Failed to save messages:", error);
  }
};

// Load messages from localStorage
export const loadMessages = (key) => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load messages:", error);
  }
  return [];
};

