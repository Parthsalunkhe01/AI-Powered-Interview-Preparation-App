import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';

const BLUE = "#4A7CF7";
const BLUE_LIGHT = "#818CF8";

const ProfileInfoCard = () => {
    const { user, clearUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [imgError, setImgError] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        clearUser();
        navigate("/");
    };

    if (!user) return null;

    const firstLetter = user.name ? user.name.charAt(0).toUpperCase() : "?";
    const hasValidImage = user.profileImageUrl && !imgError;

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Avatar */}
            {hasValidImage ? (
                <img
                    src={user.profileImageUrl}
                    alt={user.name}
                    onError={() => setImgError(true)}
                    style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: `2px solid rgba(74,124,247,0.6)`,
                        flexShrink: 0,
                    }}
                />
            ) : (
                <div
                    style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_LIGHT} 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: "800",
                        fontSize: "16px",
                        flexShrink: 0,
                        border: `2px solid rgba(74,124,247,0.5)`,
                        fontFamily: "'Inter', sans-serif",
                        boxShadow: "0 2px 10px rgba(74,124,247,0.3)",
                    }}
                >
                    {firstLetter}
                </div>
            )}

            {/* Name + Logout */}
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                <span
                    style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "#ffffff",
                        fontFamily: "'Inter', sans-serif",
                        marginBottom: "3px",
                        maxWidth: "120px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {user.name || ""}
                </span>
                <button
                    onClick={handleLogout}
                    style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: BLUE_LIGHT,
                        textAlign: "left",
                        fontFamily: "'Inter', sans-serif",
                        transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#c7d2fe")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = BLUE_LIGHT)}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default ProfileInfoCard;