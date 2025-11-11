import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { profileAPI } from "../utils/api";
import "./Profile.scss";

const Profile = () => {
  const { isAuthenticated, user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profilePicture: null,
  });
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Load user profile
    const loadProfile = async () => {
      try {
        const response = await profileAPI.getProfile();
        if (response.success) {
          setFormData({
            name: response.user.name || "",
            email: response.user.email || "",
            profilePicture: response.user.profilePicture || null,
          });
          setPreview(response.user.profilePicture || null);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };

    loadProfile();
  }, [isAuthenticated, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      setFormData({ ...formData, profilePicture: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const response = await profileAPI.updateProfile(
        formData.name,
        formData.profilePicture instanceof File ? formData.profilePicture : null
      );

      if (response.success) {
        setSuccess(true);
        // Update user in context
        if (setUser) {
          setUser(response.user);
        }
        // Update preview if new picture was uploaded
        if (response.user.profilePicture) {
          setPreview(response.user.profilePicture);
        }
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(response.error || "Failed to update profile");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePicture = async () => {
    if (!preview) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await profileAPI.updateProfile(formData.name, null, true);
      if (response.success) {
        setPreview(null);
        setFormData({ ...formData, profilePicture: null });
        if (setUser) {
          setUser({ ...response.user, profilePicture: null });
        }
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(response.error || "Failed to remove profile picture");
      }
    } catch (err) {
      setError("Failed to remove profile picture");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Profile Settings</h1>
          <p>Manage your account information and profile picture</p>
          <div className="profile-actions">
            <button type="button" className="btn-p" onClick={() => navigate("/wardrobe")}>
              View Wardrobe
            </button>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-picture-section">
            <div className="picture-preview">
              {preview ? (
                <img src={preview} alt="Profile" className="profile-img" />
              ) : (
                <div className="profile-placeholder">
                  <span className="placeholder-icon">👤</span>
                </div>
              )}
              <div className="picture-overlay">
                <button
                  type="button"
                  className="change-picture-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M13 5L15 7L10 12L7 9L2 14V16H18V5H13Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Change Photo
                </button>
                {preview && (
                  <button
                    type="button"
                    className="remove-picture-btn"
                    onClick={handleRemovePicture}
                    disabled={loading}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <p className="picture-hint">Max size: 5MB. Recommended: 400x400px</p>
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              disabled
              className="disabled-input"
            />
            <p className="field-hint">Email cannot be changed</p>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              <span className="success-icon">✓</span>
              Profile updated successfully!
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate("/")}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;

