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

// Fashion Chat API (without wardrobe - Milestone 1)
export const fashionChatAPI = {
  sendMessage: async (message, sessionId) => {
    const FASHION_CHAT_URL = import.meta.env.VITE_FASHION_CHAT_URL || "https://nexusbert-stylegpt-milestone1.hf.space";
    const response = await fetch(`${FASHION_CHAT_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, session_id: sessionId }),
    });
    return await response.json();
  },
};

// Suggest API (with wardrobe - Milestone 2)
export const suggestAPI = {
  getSuggestion: async (message, sessionId) => {
    const response = await fetch(`${API_BASE_URL}/api/suggest`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ message, session_id: sessionId }),
    });
    return await response.json();
  },
};

// Export token management functions
export { getToken, setToken, removeToken };

