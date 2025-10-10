import React from "react";
import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/" className="brand">
          🔥 Blaze Marketplace
        </Link>
      </div>
      <div className="nav-right">
        <Link to="/mint" className="nav-link">
          Mint
        </Link>
        <Link to="/marketplace" className="nav-link">
          Marketplace
        </Link>
        <Link to="/profile" className="nav-link">
          Profile
        </Link>
        <ConnectButton />
      </div>
    </nav>
  );
}