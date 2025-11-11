import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { uploadAPI } from "../utils/api";
import Header from "../components/Header";
import { PrimaryBtn } from "../components/Btn";
import "./Upload.scss";

const Upload = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadedItems, setUploadedItems] = useState([]);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 20) {
      setMessage("Maximum 20 images allowed per upload");
      return;
    }
    setFiles(selectedFiles);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!isAuthenticated) {
      setMessage("Please login to upload images");
      return;
    }

    if (files.length === 0) {
      setMessage("Please select at least one image");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const response = await uploadAPI.uploadImages(files);
      if (response.success) {
        const successMsg = response.failed && response.failed > 0
          ? `Successfully uploaded ${response.count} item(s)! ${response.failed} item(s) failed.`
          : `Successfully uploaded ${response.count} item(s)!`;
        setMessage(successMsg);
        setUploadedItems(response.items || []);
        setFiles([]);
        // Reset file input
        const fileInput = document.getElementById("file-input");
        if (fileInput) fileInput.value = "";
      } else {
        setMessage(response.error || "Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMsg = error.message?.includes("FashionCLIP") || error.message?.includes("classify")
        ? "Classification service is temporarily unavailable. Please try again in a moment."
        : error.message?.includes("timeout")
        ? "Upload timed out. Please try again with fewer images."
        : error.message || "Upload failed. Please check your connection and try again.";
      setMessage(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="upload-page">
      <Header />
      <div className="upload-container">
        <div className="upload-header">
          <h1>Upload Your Wardrobe</h1>
          <p>Upload 1-20 images of your clothing, footwear, watches, and accessories. Our AI will automatically classify and organize them for you.</p>
        </div>

        <div className="upload-card">
          <div className="upload-area">
            <input
              type="file"
              id="file-input"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <label htmlFor="file-input" className="file-label">
              <div className="upload-icon">📷</div>
              <div className="upload-text">
                {files.length > 0
                  ? `${files.length} file(s) selected`
                  : "Click to choose images (1-20 files)"}
              </div>
              <div className="upload-hint">Supports: JPEG, PNG, WebP</div>
            </label>
          </div>

          {files.length > 0 && (
            <div className="file-preview">
              <h3>Selected Files ({files.length})</h3>
              <div className="preview-grid">
                {files.slice(0, 8).map((file, index) => (
                  <div key={index} className="preview-item">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                    />
                    <span>{file.name.length > 20 ? file.name.substring(0, 20) + "..." : file.name}</span>
                  </div>
                ))}
                {files.length > 8 && (
                  <div className="preview-more">+{files.length - 8} more</div>
                )}
              </div>
            </div>
          )}

          <PrimaryBtn
            text={uploading ? "Uploading..." : "Upload Images"}
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="upload-btn"
          />

          {message && (
            <div className={`message ${message.includes("Success") ? "success" : "error"}`}>
              {message}
            </div>
          )}
        </div>

        {uploadedItems.length > 0 && (
          <div className="uploaded-items">
            <h2>Recently Uploaded Items</h2>
            <div className="items-grid">
              {uploadedItems.map((item) => (
                <div key={item.id} className="item-card">
                  <img src={item.imageUrl} alt={item.category} />
                  <div className="item-info">
                    <span className="category">{item.category}</span>
                    <span className="style">{item.style}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;

