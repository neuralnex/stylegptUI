// Format AI response to remove markdown and make it smooth
export const formatMessage = (text) => {
  if (!text) return "";
  
  // Convert to string if not already
  let formatted = String(text);
  
  // Remove markdown bold (**text**)
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "$1");
  
  // Remove markdown italic (*text*)
  formatted = formatted.replace(/\*(.*?)\*/g, "$1");
  
  // Remove markdown headers (# Header)
  formatted = formatted.replace(/^#+\s+/gm, "");
  
  // Convert markdown lists to plain text with proper spacing
  formatted = formatted.replace(/^\*\s+/gm, "• ");
  formatted = formatted.replace(/^-\s+/gm, "• ");
  formatted = formatted.replace(/^\d+\.\s+/gm, "");
  
  // Remove any trailing gibberish/corrupted text (sequences of random letters at the end)
  // This catches patterns like "lenetainedlyani" - sequences of 8+ lowercase letters at the end
  formatted = formatted.replace(/\s+[a-z]{8,}$/gi, "");
  
  // Remove any non-printable characters except newlines and spaces
  formatted = formatted.replace(/[^\x20-\x7E\n\r\t]/g, "");
  
  // Remove trailing corrupted text patterns (sequences of random lowercase letters)
  // Look for patterns like "lenetainedlyani" - long sequences without proper word structure
  formatted = formatted.replace(/\s+[a-z]{10,}(?![a-z])/gi, "");
  
  // Clean up multiple newlines
  formatted = formatted.replace(/\n{3,}/g, "\n\n");
  
  // Remove multiple spaces
  formatted = formatted.replace(/ {2,}/g, " ");
  
  // Trim whitespace
  formatted = formatted.trim();
  
  // Remove any trailing punctuation that doesn't make sense
  formatted = formatted.replace(/[^\w\s.,!?;:)\]]+$/g, "");
  
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

