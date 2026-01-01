import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Link,
  Spacer,
  Image,
} from "@heroui/react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import "./Register.scss";

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!name || !email || !password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const result = await register(name, email, password);
      if (result.success) {
        navigate("/");
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (err) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <Header />
      <div className="register-container">
        <Card className="register-card" radius="lg" shadow="md">
          <CardHeader className="register-header">
            <div className="register-header-content">
              <Image src="/logo.png" alt="StyleGPT" className="register-logo" radius="md" />
              <h1>
                Welcome to <span className="brand-name">StyleGPT</span>
              </h1>
              <h2>Create Your Account</h2>
              <p>
                Join StyleGPT and start organizing your wardrobe with AI-powered
                fashion assistance
              </p>
            </div>
          </CardHeader>

          <CardBody className="register-body">
            <form className="register-form" onSubmit={handleSubmit}>
              <Input
                label="Full Name"
                variant="bordered"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                isRequired
              />
              <Spacer y={2} />
              <Input
                label="Email"
                variant="bordered"
                fullWidth
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                isRequired
              />
              <Spacer y={2} />
              <Input
                label="Password"
                variant="bordered"
                fullWidth
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password (min. 6 characters)"
                minLength={6}
                isRequired
              />

              {error && <div className="error-message">{error}</div>}

              <Button
                fullWidth
                type="submit"
                color="primary"
                variant="solid"
                isLoading={loading}
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>
          </CardBody>

          <CardFooter className="register-footer">
            <p>
              Already have an account?{" "}
              <Link as={RouterLink} to="/login" color="primary">
                Login here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;

