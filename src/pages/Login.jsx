import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import { PrimaryBtn } from "../components/Btn";
import "./Login.scss";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate("/");
      } else {
        setError(result.error || "Invalid email or password");
      }
    } catch (err) {
      setError(err.message || "Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Header />
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img src="/logo.png" alt="StyleGPT" className="login-logo" />
            <h1>
              Welcome to <span className="brand-name">StyleGPT</span>
            </h1>
            <h2>Sign in to continue</h2>
            <p>
              Access your personalized wardrobe, AI stylist chat, and outfit
              recommendations.
            </p>
          </div>

          <div className="login-social">
            <button className="social-button google" type="button" disabled>
              Continue with Google (coming soon)
            </button>
            <div className="social-icons">
              <button type="button" disabled>
                
              </button>
              <button type="button" disabled>
                f
              </button>
            </div>
          </div>

          <div className="divider">
            <span></span>
            <p>or login with your email</p>
            <span></span>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="form-actions">
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            {error && <div className="error-message">{error}</div>}

            <PrimaryBtn type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </PrimaryBtn>
          </form>

          <div className="login-footer">
            <p>
              New to StyleGPT?{" "}
              <Link to="/register" className="register-link">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

