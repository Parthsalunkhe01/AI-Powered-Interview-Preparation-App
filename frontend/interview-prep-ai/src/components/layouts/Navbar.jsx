import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import ProfileInfoCard from "../Cards/ProfileInfoCard";

// Blue-indigo accent palette
const BLUE = "#4A7CF7";
const BLUE_LIGHT = "#818CF8";
const BLUE_GLOW = "rgba(74,124,247,0.30)";
const BLUE_MUTED = "rgba(74,124,247,0.12)";
const BLUE_BORDER = "rgba(74,124,247,0.30)";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Resources", path: "/resources" },
  { label: "Contact Us", path: "/contact" },
];

const Navbar = ({ onLoginClick }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 9999,
          width: "100%",
          height: "58px",
          background: scrolled
            ? "rgba(15, 20, 30, 0.98)"
            : "linear-gradient(135deg, #0f141e 0%, #1a2438 60%, #101928 100%)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: scrolled
            ? "0 2px 24px rgba(0,0,0,0.45)"
            : `0 1px 0 ${BLUE_MUTED}`,
          transition: "all 0.3s ease",
          borderBottom: `1px solid rgba(74,124,247,0.10)`,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "1300px",
            margin: "0 auto",
            padding: "0 24px",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          {/* ── Logo ── */}
          <Link to="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "8px",
                  background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_LIGHT} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 12px ${BLUE_GLOW}`,
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    fill="white"
                  />
                </svg>
              </div>
              <span style={{ fontSize: "18px", fontWeight: "800", color: BLUE, letterSpacing: "-0.5px" }}>
                Interview
              </span>
              <span style={{ fontSize: "18px", fontWeight: "700", color: "#f1f5f9", letterSpacing: "-0.5px" }}>
                Prep AI
              </span>
            </div>
          </Link>

          {/* ── Nav Links ── */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              flex: 1,
              justifyContent: "center",
            }}
          >
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link key={link.path} to={link.path} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      position: "relative",
                      padding: "7px 18px",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      fontWeight: active ? "700" : "500",
                      color: active ? BLUE : "#94a3b8",
                      background: active ? BLUE_MUTED : "transparent",
                      border: active ? `1px solid ${BLUE_BORDER}` : "1px solid transparent",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      whiteSpace: "nowrap",
                      letterSpacing: "0.01em",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.color = "#e2e8f0";
                        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                        e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.color = "#94a3b8";
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.border = "1px solid transparent";
                      }
                    }}
                  >
                    {link.label}
                    {active && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "4px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "4px",
                          height: "4px",
                          borderRadius: "50%",
                          background: BLUE,
                        }}
                      />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* ── Right: Profile or Login ── */}
          <div style={{ flexShrink: 0 }}>
            {user ? (
              <ProfileInfoCard />
            ) : (
              <button
                onClick={() => { if (onLoginClick) onLoginClick(); else navigate("/"); }}
                style={{
                  background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_LIGHT} 100%)`,
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 22px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                  boxShadow: `0 4px 14px ${BLUE_GLOW}`,
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 6px 20px rgba(74,124,247,0.45)`;
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 4px 14px ${BLUE_GLOW}`;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;