import React from "react";
import { motion } from "framer-motion";

const SaaSCard = ({ children, className = "", hover = true, delay = 0 }) => {
  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
        whileHover={hover ? { y: -4, transition: { duration: 0.3 } } : {}}
        className={`rounded-[32px] p-8 relative transition-all duration-500 border border-white/5 ring-1 ring-white/5 hover:border-primary/30 !bg-[#0B1220] !backdrop-blur-3xl group ${className}`}
        data-saas-card-v2="true"
        style={{
          boxShadow: "0 40px 100px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05) inset",
        }}
    >
      {/* ── Subtitle Accent Glow ── */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/2 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default SaaSCard;

