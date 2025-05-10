import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Header.css";

const Header = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [wallet, setWallet] = useState({ balance: 0, winnings: 0 });

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
    document.body.style.overflow = !sidebarActive ? "hidden" : "auto";
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth >= 992 && sidebarActive) {
        setSidebarActive(false);
        document.body.style.overflow = "auto";
      }
    };

    const fetchWallet = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("http://127.0.0.1:8000/api/wallet/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setWallet(res.data);
      } catch (error) {
        console.error("Wallet fetch failed", error);
      }
    };

    fetchWallet();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarActive]);

  const sidebarItems = [
    { name: "Home", icon: "home", path: "/" },
    { name: "Play", icon: "play", path: "/play" },
    { name: "Login", icon: "sign-in-alt", path: "/login" },
    { name: "Register", icon: "user-plus", path: "/register" },
    { name: "My Profile", icon: "user", path: "/profile" },
    { name: "My Wallet", icon: "wallet", path: "/wallet" },
    { name: "Game History", icon: "history", path: "/history" },
    { name: "Transactions History", icon: "exchange-alt", path: "/transactions" },
    { name: "Refer & Earn", icon: "users", path: "/refer" },
    { name: "Terms & Conditions", icon: "file-text", path: "/terms" },
    { name: "Refund Policy", icon: "wallet", path: "/refund" },
    { name: "Privacy Policy", icon: "lock", path: "/privacy" },
    { name: "Support", icon: "headset", path: "/support" },
  ];

  return (
    <div className="header-container">
      <nav className="navbar-custom">
        <div className="container">
          <button className="navbar-toggler-box" onClick={toggleSidebar}>
            <i className="fas fa-bars" />
          </button>

          <div className="navbar-brand-box">
            <Link className="navbar-brand-custom" to="/">
              <i className="fas fa-crown me-2" /> VN
            </Link>
          </div>

          {/* Wallet values */}
          <div className="wallet-info">
            <Link to="/wallet" className="wallet-box">
              <div className="wallet-amount">
                <i className="fas fa-coins" />
                <span>₹{wallet.balance}</span>
              </div>
              <div className="wallet-label">Wallet</div>
            </Link>
            <Link to="/wallet" className="wallet-box winning-box">
              <div className="wallet-amount">
                <i className="fas fa-trophy" />
                <span>₹{wallet.winnings}</span>
              </div>
              <div className="wallet-label">Winnings</div>
            </Link>
          </div>
        </div>
      </nav>

      {sidebarActive && (
        <>
          <div className="sidebar-overlay" onClick={toggleSidebar} />
          <div className="sidebar">
            <div className="sidebar-header">
              <h3>
                <i className="fas fa-crown me-2" /> Menu
              </h3>
              <button onClick={toggleSidebar}>
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="sidebar-items">
              {sidebarItems.map((item, i) => (
                <div key={i}>
                  <Link to={item.path} className="sidebar-item" onClick={toggleSidebar}>
                    <i className={`fas fa-${item.icon} me-3`} /> {item.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="rules-btn-container">
        <button className="rules-button">
          <i className="fas fa-scroll" /> Game Rules
        </button>
        <Link to="/mychips" className="rules-button">
          <i className="fas fa-dice" /> MY BETS
        </Link>
      </div>
    </div>
  );
};

export default Header;
