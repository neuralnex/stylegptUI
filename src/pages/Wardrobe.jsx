import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { wardrobeAPI } from "../utils/api";
import Header from "../components/Header";
import { Image, Button } from "@heroui/react";
import "./Wardrobe.scss";

const Wardrobe = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [style, setStyle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [animating, setAnimating] = useState(false);

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
    setSelectedCategory(null);
    fetchItems();
  };

  const groupByCategory = (itemsList) => {
    const grouped = {};
    itemsList.forEach(item => {
      const category = item.category || "other";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    return grouped;
  };

  const handleCategoryClick = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setAnimating(true);
      setSelectedCategory(category);
      setTimeout(() => setAnimating(false), 600);
    }
  };

  const categories = groupByCategory(items);
  const categoryList = Object.keys(categories).sort();

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
            <Button type="submit" color="primary" variant="solid" radius="full" className="btn-p">
              Apply
            </Button>
            <Button type="button" variant="light" radius="full" className="btn-clear" onPress={clearFilters}>
              Clear
            </Button>
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
            <Button color="primary" variant="solid" radius="full" className="btn-p" onPress={() => navigate("/upload")}>
              Upload Wardrobe
            </Button>
          </div>
        ) : (
          <div className="wardrobe-categories">
            <div className="categories-list">
              {categoryList.map((category) => {
                const active = selectedCategory === category;
                return (
                  <Button
                    key={category}
                    className={`category-btn ${active ? "active" : ""}`}
                    onPress={() => handleCategoryClick(category)}
                    variant={active ? "solid" : "bordered"}
                    color={active ? "primary" : "default"}
                    radius="full"
                    size="sm"
                  >
                    <span className="category-name">{category}</span>
                    <span className="category-count">({categories[category].length})</span>
                  </Button>
                );
              })}
            </div>

            <div className={`wardrobe-items-container ${animating ? "animating" : ""}`}>
              {selectedCategory ? (
                <div className="category-items">
                  <h2 className="category-title">{selectedCategory}</h2>
                  <div className="wardrobe-grid">
                    {categories[selectedCategory].map((item, index) => (
                      <div 
                        key={item.id} 
                        className="wardrobe-card"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <Button
                          isIconOnly
                          variant="light"
                          radius="full"
                          className="delete-btn"
                          onPress={() => handleDelete(item.id, item.category)}
                          title="Delete item"
                          aria-label="Delete item"
                        >
                          ×
                        </Button>
                        <Image
                          src={item.processedImageUrl || item.imageUrl}
                          alt={item.name || item.category}
                          radius="md"
                        />
                        <div className="meta">
                          <div className="row">
                            <span className="category">{item.name || item.category}</span>
                            <span className={`style style-${item.style}`}>{item.style}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="wardrobe-grid all-items">
                  {items.map((item) => (
                    <div key={item.id} className="wardrobe-card">
                      <Button
                        isIconOnly
                        variant="light"
                        radius="full"
                        className="delete-btn"
                        onPress={() => handleDelete(item.id, item.category)}
                        title="Delete item"
                        aria-label="Delete item"
                      >
                        ×
                      </Button>
                      <Image
                        src={item.processedImageUrl || item.imageUrl}
                        alt={item.name || item.category}
                        radius="md"
                      />
                      <div className="meta">
                        <div className="row">
                          <span className="category">{item.name || item.category}</span>
                          <span className={`style style-${item.style}`}>{item.style}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wardrobe;


