import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, Home, LogOut, User, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/dashboard" className="navbar-logo">
          <Zap className="logo-icon" />
          <span className="logo-text">Smart Task Planner</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-nav desktop-nav">
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <Home size={18} />
            Dashboard
          </Link>
        </div>

        {/* User Menu */}
        <div className="navbar-user">
          <div className="user-info desktop-only">
            <User size={18} />
            <span>{user?.name || 'User'}</span>
          </div>

          <button 
            className="logout-btn desktop-only"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={18} />
          </button>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn mobile-only"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <Link 
              to="/dashboard" 
              className={`mobile-nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home size={18} />
              Dashboard
            </Link>

            <div className="mobile-user-info">
              <User size={18} />
              <span>{user?.name || 'User'}</span>
            </div>

            <button 
              className="mobile-logout-btn"
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Powered by banner */}
      <div className="powered-by-banner">
        <span>⚡ Powered by Groq's Lightning-Fast LLMs</span>
      </div>
    </nav>
  );
};

export default Navbar;