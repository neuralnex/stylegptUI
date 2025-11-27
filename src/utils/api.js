const API_BASE_URL = import.meta.env.VITE_API_URL || "https://nexusbert-stylegpt-milestone2.hf.space";

// Helper function to get auth token from localStorage
const getToken = () => {
  return localStorage.getItem("token");
};

// Helper function to set auth token
const setToken = (token) => {
  localStorage.setItem("token", token);
};

// Helper function to remove auth token
const removeToken = () => {
  localStorage.removeItem("token");
};

// Helper function to make authenticated requests
const authHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// Auth API
export const authAPI = {
  register: async (name, email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (data.success && data.token) {
      setToken(data.token);
    }
    return data;
  },

  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.success && data.token) {
      setToken(data.token);
    }
    return data;
  },

  logout: () => {
    removeToken();
  },
};

// Profile API
export const profileAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: "GET",
      headers: authHeaders(),
    });
    return await response.json();
  },

  updateProfile: async (name, profilePictureFile, removePicture = false) => {
    const formData = new FormData();
    if (name) {
      formData.append("name", name);
    }
    if (profilePictureFile) {
      formData.append("profilePicture", profilePictureFile);
    }
    if (removePicture) {
      formData.append("removePicture", "true");
    }

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: "PUT",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    });
    return await response.json();
  },
};

// Upload API
export const uploadAPI = {
  uploadImages: async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("image", file);
    });

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    });
    return await response.json();
  },
};

// Wardrobe API
export const wardrobeAPI = {
  list: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.style) query.set("style", params.style);
    if (params.q) query.set("q", params.q);
    const qs = query.toString();
    const response = await fetch(`${API_BASE_URL}/api/wardrobe${qs ? `?${qs}` : ""}`, {
      method: "GET",
      headers: authHeaders(),
    });
    return await response.json();
  },
  delete: async (itemId) => {
    const response = await fetch(`${API_BASE_URL}/api/wardrobe/${itemId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return await response.json();
  },
};
// Fashion Chat API (without wardrobe - Milestone 1)
export const fashionChatAPI = {
  sendMessage: async (message, sessionId, retryCount = 0) => {
    try {
      const FASHION_CHAT_URL = import.meta.env.VITE_FASHION_CHAT_URL || "https://nexusbert-stylegpt-milestone1.hf.space";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout
      
      const response = await fetch(`${FASHION_CHAT_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, session_id: sessionId }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // If it's a 503 or 502 (service unavailable), retry once
        if ((response.status === 503 || response.status === 502) && retryCount < 1) {
          console.log("Service unavailable, retrying...");
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          return fashionChatAPI.sendMessage(message, sessionId, retryCount + 1);
        }
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error("Request timeout. Please try again.");
      }
      // Retry on network errors for first request
      if (retryCount < 1 && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        console.log("Network error, retrying...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fashionChatAPI.sendMessage(message, sessionId, retryCount + 1);
      }
      console.error("Fashion chat API error:", error);
      throw error;
    }
  },
};

// Suggest API (with wardrobe - Milestone 2)
export const suggestAPI = {
  getSuggestion: async (message, sessionId, retryCount = 0) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout
      
      const response = await fetch(`${API_BASE_URL}/api/suggest`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ message, session_id: sessionId }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // If it's a 503 or 502 (service unavailable), retry once
        if ((response.status === 503 || response.status === 502) && retryCount < 1) {
          console.log("Service unavailable, retrying...");
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          return suggestAPI.getSuggestion(message, sessionId, retryCount + 1);
        }
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error("Request timeout. Please try again.");
      }
      // Retry on network errors for first request
      if (retryCount < 1 && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        console.log("Network error, retrying...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        return suggestAPI.getSuggestion(message, sessionId, retryCount + 1);
      }
      console.error("Suggest API error:", error);
      throw error;
    }
  },
};

// Export token management functions
export { getToken, setToken, removeToken };

