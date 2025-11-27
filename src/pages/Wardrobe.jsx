import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { wardrobeAPI } from "../utils/api";
import Header from "../components/Header";
import "./Wardrobe.scss";

const Wardrobe = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [style, setStyle] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, navigate]);

  const fetchItems = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await wardrobeAPI.list(params);
      if (res.success) {
        setItems(res.items || []);
      } else {
        setError(res.error || "Failed to load wardrobe");
      }
    } catch (err) {
      setError(err.message || "Failed to load wardrobe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems({ q, style });
  };

  const clearFilters = () => {
    setQ("");
    setStyle("");
    fetchItems();
  };

  const handleDelete = async (itemId, itemCategory) => {
    if (!window.confirm(`Are you sure you want to delete this ${itemCategory}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await wardrobeAPI.delete(itemId);
      if (res.success) {
        // Remove item from local state
        setItems(items.filter((item) => item.id !== itemId));
      } else {
        alert(res.error || "Failed to delete item");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.message || "Failed to delete item. Please try again.");
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="wardrobe-page">
      <Header />
      <div className="wardrobe-container">
        <div className="wardrobe-header">
          <div className="header-top">
            <div>
              <h1>Your Wardrobe</h1>
              <p>Browse all items you've uploaded. Use filters to find things quicker.</p>
            </div>
            <button 
              className="btn-3d" 
              onClick={() => navigate("/wardrobe-3d")}
              title="View in 3D"
            >
              🎨 3D View
            </button>
          </div>
          <form className="filters" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search category (e.g., shirt, shoes, watch)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select value={style} onChange={(e) => setStyle(e.target.value)}>
              <option value="">All styles</option>
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
              <option value="streetwear">Streetwear</option>
              <option value="sportswear">Sportswear</option>
            </select>
            <button type="submit" className="btn-p">Apply</button>
            <button type="button" className="btn-clear" onClick={clearFilters}>Clear</button>
          </form>
        </div>

        {loading ? (
          <div className="wardrobe-loading">Loading wardrobe...</div>
        ) : error ? (
          <div className="wardrobe-error">{error}</div>
        ) : items.length === 0 ? (
          <div className="wardrobe-empty">
            <h2>No items yet</h2>
            <p>Upload your clothes in Upload Wardrobe to see them here.</p>
            <button className="btn-p" onClick={() => navigate("/upload")}>Upload Wardrobe</button>
          </div>
        ) : (
          <div className="wardrobe-grid">
            {items.map((item) => (
              <div key={item.id} className="wardrobe-card">
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(item.id, item.category)}
                  title="Delete item"
                  aria-label="Delete item"
                >
                  ×
                </button>
                <img src={item.processedImageUrl || item.imageUrl} alt={item.category} />
                <div className="meta">
                  <div className="row">
                    <span className="category">{item.category}</span>
                    <span className={`style style-${item.style}`}>{item.style}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wardrobe;


