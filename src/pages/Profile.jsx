import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardBody, CardHeader, CardFooter, Input, Avatar, Divider } from "@heroui/react";
import { useAuth } from "../context/AuthContext";
import { profileAPI, avatarAPI } from "../utils/api";
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
  const [showAvatarCreator, setShowAvatarCreator] = useState(false);
  const [avatarId, setAvatarId] = useState(null);
  const iframeRef = useRef(null);
  const [avatarRenderUrl, setAvatarRenderUrl] = useState(null);

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
          setAvatarId(response.user.readyPlayerMeAvatarId || null);
          
          // Set profile picture - prefer profilePicture from backend, fallback to avatar render
          if (response.user.profilePicture) {
            setPreview(response.user.profilePicture);
            setAvatarRenderUrl(response.user.profilePicture);
          } else if (response.user.readyPlayerMeAvatarId) {
            try {
              const avatarResponse = await avatarAPI.getAvatarRender({
                size: 400,
                quality: 90,
                camera: "portrait",
              });
              if (avatarResponse.success) {
                setPreview(avatarResponse.renderUrl);
                setAvatarRenderUrl(avatarResponse.renderUrl);
              }
            } catch (err) {
              console.error("Failed to load avatar render:", err);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };

    loadProfile();
  }, [isAuthenticated, navigate]);


  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const response = await profileAPI.updateProfile(formData.name);

      if (response.success) {
        setSuccess(true);
        // Update user in context
        if (setUser) {
          setUser(response.user);
        }
        // Update preview with avatar render if available
        if (response.user.readyPlayerMeAvatarId) {
          try {
            const avatarResponse = await avatarAPI.getAvatarRender({
              size: 400,
              quality: 90,
              camera: "portrait",
            });
            if (avatarResponse.success) {
              setPreview(avatarResponse.renderUrl);
              setAvatarRenderUrl(avatarResponse.renderUrl);
            }
          } catch (err) {
            console.error("Failed to load avatar render:", err);
          }
        } else if (response.user.profilePicture) {
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

  useEffect(() => {
    if (!showAvatarCreator) return;

    const handleMessage = async (event) => {
      if (event.data?.source !== "readyplayerme") return;

      if (event.data.eventName === "v1.avatar.exported") {
        const { avatarId: newAvatarId } = event.data.data;
        if (newAvatarId) {
          try {
            const response = await avatarAPI.createAvatar(newAvatarId);
            if (response.success) {
              setAvatarId(newAvatarId);
              setShowAvatarCreator(false);
              
              // Reload profile to get updated profile picture
              try {
                const profileResponse = await profileAPI.getProfile();
                if (profileResponse.success) {
                  setFormData({
                    ...formData,
                    profilePicture: profileResponse.user.profilePicture || null,
                  });
                  if (profileResponse.user.profilePicture) {
                    setPreview(profileResponse.user.profilePicture);
                    setAvatarRenderUrl(profileResponse.user.profilePicture);
                  } else {
                    // Fallback: Get avatar render directly
                    const avatarResponse = await avatarAPI.getAvatarRender({
                      size: 400,
                      quality: 90,
                      camera: "portrait",
                    });
                    if (avatarResponse.success) {
                      setPreview(avatarResponse.renderUrl);
                      setAvatarRenderUrl(avatarResponse.renderUrl);
                    }
                  }
                  // Update user in context
                  if (setUser) {
                    setUser(profileResponse.user);
                  }
                }
              } catch (err) {
                console.error("Failed to reload profile:", err);
                // Fallback: Get avatar render directly
                try {
                  const avatarResponse = await avatarAPI.getAvatarRender({
                    size: 400,
                    quality: 90,
                    camera: "portrait",
                  });
                  if (avatarResponse.success) {
                    setPreview(avatarResponse.renderUrl);
                    setAvatarRenderUrl(avatarResponse.renderUrl);
                  }
                } catch (renderErr) {
                  console.error("Failed to load avatar render:", renderErr);
                }
              }
              
              setSuccess(true);
              setTimeout(() => setSuccess(false), 3000);
            } else {
              setError(response.error || "Failed to save avatar");
            }
          } catch (err) {
            setError("Failed to save avatar");
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [showAvatarCreator]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <Card className="profile-card" radius="lg" shadow="md">
          <CardHeader className="profile-header">
            <div>
              <h1>Profile Settings</h1>
              <p>Manage your account information and profile picture</p>
              <div className="profile-actions">
                <Button color="secondary" variant="flat" radius="full" onPress={() => navigate("/wardrobe")}>
                  View Wardrobe
                </Button>
                <Button
                  color="primary"
                  variant="solid"
                  radius="full"
                  onPress={() => setShowAvatarCreator(true)}
                >
                  {avatarId ? "Edit Avatar" : "Create Avatar"}
                </Button>
              </div>
            </div>
          </CardHeader>

          <Divider />

          <CardBody className="profile-body">
            <div className="profile-picture-section">
              <div className="picture-preview">
                {preview ? (
                  <Avatar
                    src={preview}
                    name={formData.name || "Profile"}
                    className="profile-img"
                    color="primary"
                    isBordered
                    radius="lg"
                    size="xl"
                  />
                ) : (
                  <div className="profile-placeholder">
                    <span className="placeholder-icon">👤</span>
                    <p className="placeholder-text">Create an avatar to set your profile picture</p>
                  </div>
                )}
                <div className="picture-overlay">
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    radius="full"
                    onPress={() => setShowAvatarCreator(true)}
                  >
                    {avatarId ? "Edit Avatar" : "Create Avatar"}
                  </Button>
                </div>
              </div>
              <p className="picture-hint">
                {avatarId
                  ? "Profile picture is generated from your Ready Player Me avatar"
                  : "Create an avatar to automatically generate your profile picture"}
              </p>
            </div>

            <div className="form-group">
              <Input
                label="Full Name"
                variant="bordered"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                isRequired
              />
            </div>

            <div className="form-group">
              <Input
                label="Email"
                variant="bordered"
                fullWidth
                value={formData.email}
                isDisabled
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
          </CardBody>

          <CardFooter className="form-actions">
            <Button variant="bordered" radius="full" onPress={() => navigate("/")}>
              Cancel
            </Button>
            <Button
              color="primary"
              variant="solid"
              radius="full"
              isLoading={loading}
              onPress={handleSubmit}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>

        {showAvatarCreator && (
          <div className="avatar-creator-modal">
            <div className="avatar-creator-content">
              <div className="avatar-creator-header">
                <h2>Create Your Avatar</h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowAvatarCreator(false)}
                >
                  ×
                </button>
              </div>
              <iframe
                ref={iframeRef}
                src={`https://${import.meta.env.VITE_READY_PLAYER_ME_SUBDOMAIN || ""}.readyplayer.me/avatar?frameApi${avatarId ? `&id=${avatarId}` : ""}`}
                width="100%"
                height="600px"
                frameBorder="0"
                allow="camera *; microphone *"
                style={{ border: "none", borderRadius: "8px" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

