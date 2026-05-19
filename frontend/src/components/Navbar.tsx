/**
 * Navbar — Dark glassmorphism navbar with gradient logo
 * Shows different links based on auth state
 */
import "../styles/navbar.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../axios";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("api/auth/me");
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const logout = async () => {
    try {
      await api.get("/api/auth/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      setIsLoggedIn(false);
      navigate("/", { replace: true });
      window.location.replace("/");
    }
  };

  const loginWithGoogle = () => {
    window.location.href = new URL(
      "/api/auth/google",
      import.meta.env.VITE_BASE_URL
    ).toString();
  };

  /** Helper to check if a link is active */
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="navbar" id="main-navbar">
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo" id="nav-logo" onClick={closeMenu}>
            PracticeCF
          </Link>

          {/* Mobile hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>

          {/* Nav links */}
          <div className={`navbar-actions ${menuOpen ? "open" : ""}`}>
            <Link to="/" className={isActive("/") ? "active" : ""} onClick={closeMenu}>
              Home
            </Link>

            {isLoggedIn && (
              <>
                <Link
                  to="/dashboard"
                  className={isActive("/dashboard") ? "active" : ""}
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/discuss"
                  className={isActive("/discuss") ? "active" : ""}
                  onClick={closeMenu}
                >
                  Discuss
                </Link>
                <Link
                  to="/profile"
                  className={isActive("/profile") ? "active" : ""}
                  onClick={closeMenu}
                >
                  Profile
                </Link>
              </>
            )}

            {!isLoggedIn ? (
              <button
                onClick={() => {
                  closeMenu();
                  loginWithGoogle();
                }}
                className="nav-btn-login"
                id="nav-login-btn"
              >
                Sign in with Google
              </button>
            ) : (
              <button
                onClick={() => {
                  closeMenu();
                  void logout();
                }}
                className="nav-btn-logout"
                id="nav-logout-btn"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>
      {/* Spacer to push content below fixed navbar */}
      <div className="navbar-spacer" />
    </>
  );
};

export default Navbar;
