import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { uploadAPI } from "../utils/api";
import { PrimaryBtn } from "./Btn";
import "./UploadSection.scss";

const UploadSection = () => {
  const { isAuthenticated } = useAuth();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadedItems, setUploadedItems] = useState([]);

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
        setMessage(`Successfully uploaded ${response.count} item(s)!`);
        setUploadedItems(response.items || []);
        setFiles([]);
        // Reset file input
        const fileInput = document.getElementById("file-input");
        if (fileInput) fileInput.value = "";
      } else {
        setMessage(response.error || "Upload failed");
      }
    } catch (error) {
      setMessage(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="upload-section">
      <div className="container">
        <h2>Upload Your Wardrobe</h2>
        <p>Upload 1-20 images of your clothing, footwear, watches, and accessories</p>
        
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
            {files.length > 0
              ? `${files.length} file(s) selected`
              : "Choose images (1-20 files)"}
          </label>
        </div>

        {files.length > 0 && (
          <div className="file-preview">
            {files.slice(0, 5).map((file, index) => (
              <div key={index} className="preview-item">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                />
                <span>{file.name}</span>
              </div>
            ))}
            {files.length > 5 && (
              <div className="preview-more">+{files.length - 5} more</div>
            )}
          </div>
        )}

        <PrimaryBtn
          text={uploading ? "Uploading..." : "Upload Images"}
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
        />

        {message && (
          <div className={`message ${message.includes("Success") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        {uploadedItems.length > 0 && (
          <div className="uploaded-items">
            <h3>Recently Uploaded:</h3>
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
    </section>
  );
};

export default UploadSection;

