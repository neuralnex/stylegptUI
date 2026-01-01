import React, { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Input,
  Link,
  Spacer,
  Image,
} from "@heroui/react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
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
        <Card className="login-card" radius="lg" shadow="md">
          <CardHeader className="login-header">
            <div className="login-header-content">
              <Image src="/logo.png" alt="StyleGPT" className="login-logo" radius="md" />
              <h1>
                Welcome to <span className="brand-name">StyleGPT</span>
              </h1>
              <h2>Sign in to continue</h2>
              <p>
                Access your personalized wardrobe, AI stylist chat, and outfit
                recommendations.
              </p>
            </div>
          </CardHeader>

          <CardBody className="login-body">
            <div className="login-social">
              <Button fullWidth variant="bordered" isDisabled>
                Continue with Google (coming soon)
              </Button>
              <div className="social-icons">
                <Button isDisabled radius="full" size="sm" variant="flat">
                  
                </Button>
                <Button isDisabled radius="full" size="sm" variant="flat">
                  f
                </Button>
              </div>
            </div>

            <div className="divider">
              <Divider />
              <p>or login with your email</p>
              <Divider />
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <Input
                label="Email"
                variant="bordered"
                fullWidth
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                isRequired
              />
              <Spacer y={2} />
              <Input
                label="Password"
                variant="bordered"
                fullWidth
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                isRequired
              />
              <div className="form-actions">
                <Link as={RouterLink} to="/forgot-password" color="primary">
                  Forgot password?
                </Link>
              </div>

              {error && <div className="error-message">{error}</div>}

              <Button
                fullWidth
                type="submit"
                color="primary"
                variant="solid"
                isLoading={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardBody>

          <CardFooter className="login-footer">
            <p>
              New to StyleGPT?{" "}
              <Link as={RouterLink} to="/register" color="primary">
                Create an account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;

