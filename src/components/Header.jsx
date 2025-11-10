import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PrimaryBtn } from "./Btn";
import { useAuth } from "../context/AuthContext";
import "./Header.scss";

const headerMenu = [
  { name: "Upload Wardrobe", path: "/upload" },
  { name: "Blog", path: "/blog" },
];

const Header = () => {
  const [active, setActive] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="header">
      <div className="container">
        <h1 className="logo">StyleGPT</h1>
        <div className={active ? `nav active` : `nav`}>
          <ul>
            {headerMenu.map((elem, index) => (
              <li key={index}>
                <Link to={elem.path}>{elem.name}</Link>
              </li>
            ))}
          </ul>
          <div className="btns-groups">
            {isAuthenticated ? (
              <>
                <span className="user-name">{user?.name}</span>
                <Link className="btn-chat btn-p" to="/fashion-chat">
                  Fashion Chat
                </Link>
                <Link className="btn-chat btn-p" to="/chat">
                  Wardrobe Chat
                </Link>
                <PrimaryBtn text="Logout" onClick={handleLogout} />
              </>
            ) : (
              <>
                <Link to="/login" className="btn-login-link">
                  Login
                </Link>
                <Link to="/register" className="btn-register btn-p">
                  Sign Up
                </Link>
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
    </div>
  );
};

export default Header;
