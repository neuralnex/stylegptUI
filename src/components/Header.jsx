import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PrimaryBtn } from "./Btn";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import "./Header.scss";

const headerMenu = ["Projects", "Services", "Studio", "Blog"];

const Header = () => {
  const [active, setActive] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setShowAuthModal(false);
  };

  return (
    <div className="header">
      <div className="container">
        <h1 className="logo">StyleGPT</h1>
        <div className={active ? `nav active` : `nav`}>
          <ul>
            {headerMenu.map((elem, index) => (
              <li key={index}>
                <Link to={`/${elem}`}>{elem}</Link>
              </li>
            ))}
          </ul>
          <div className="btns-groups">
            {isAuthenticated ? (
              <>
                <span className="user-name">{user?.name}</span>
                <Link className="btn-chat btn-p" to="/chat">
                  Chat
                </Link>
                <PrimaryBtn text="Logout" onClick={handleLogout} />
              </>
            ) : (
              <>
                <PrimaryBtn text="Login" onClick={() => setShowAuthModal(true)} />
              </>
            )}
            <div
              className={active ? `hamburger active` : `hamburger`}
              onClick={() => setActive(!active)}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export default Header;
