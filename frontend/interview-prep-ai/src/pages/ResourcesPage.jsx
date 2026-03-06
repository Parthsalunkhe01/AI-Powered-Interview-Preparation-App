import React from "react";
import Navbar from "../components/layouts/Navbar";

const BLUE = "#4A7CF7";
const BLUE_LIGHT = "#818CF8";

const ResourcesPage = () => {
    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0f1827 0%, #141c2e 50%, #111928 100%)" }}>
            <Navbar />
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "calc(100vh - 58px)",
                    gap: "20px",
                    padding: "40px 24px",
                    position: "relative",
                }}
            >
                {/* Glow blob */}
                <div style={{
                    position: "absolute",
                    width: "400px",
                    height: "400px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(74,124,247,0.08) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />

                {/* Icon */}
                <div
                    style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "24px",
                        background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_LIGHT} 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "36px",
                        boxShadow: `0 8px 32px rgba(74,124,247,0.35)`,
                    }}
                >
                    📚
                </div>

                <div style={{ textAlign: "center" }}>
                    <h1 style={{ fontSize: "36px", fontWeight: "800", color: "#f1f5f9", margin: "0 0 10px 0", fontFamily: "'Inter', sans-serif", letterSpacing: "-0.5px" }}>
                        Resources
                    </h1>
                    <p style={{ fontSize: "16px", color: "#64748b", margin: 0, fontFamily: "'Inter', sans-serif" }}>
                        Coming soon — study materials, guides, and more.
                    </p>
                </div>

                <div style={{
                    padding: "8px 20px",
                    borderRadius: "20px",
                    background: "rgba(74,124,247,0.10)",
                    border: "1px solid rgba(74,124,247,0.25)",
                    color: BLUE_LIGHT,
                    fontSize: "13px",
                    fontWeight: "600",
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "0.05em",
                }}>
                     Under Construction
                </div>
            </div>
        </div>
    );
};

export default ResourcesPage;
