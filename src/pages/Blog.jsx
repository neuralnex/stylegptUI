import React from "react";
import Header from "../components/Header";
import "./Blog.scss";

const Blog = () => {
  return (
    <div className="blog-page">
      <Header />
      <div className="blog-container">
        <div className="coming-soon-card">
          <div className="coming-soon-icon">📝</div>
          <h1>Coming Soon</h1>
          <p>Our blog is currently under development. Check back soon for fashion tips, style guides, and AI-powered outfit inspiration!</p>
          <div className="features-preview">
            <div className="feature-item">
              <span className="feature-icon">✨</span>
              <span>Fashion Trends</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👗</span>
              <span>Style Guides</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🤖</span>
              <span>AI Insights</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;

