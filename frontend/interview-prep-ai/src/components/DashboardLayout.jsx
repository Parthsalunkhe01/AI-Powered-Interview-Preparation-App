import React, { useState } from "react";
import Sidebar from "./layouts/Sidebar";
import Topbar from "./layouts/Topbar";
import { UserContext } from "../context/userContext";
import { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";


const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useContext(UserContext);

  return (
    <div className="flex min-h-screen bg-[#09090b] text-foreground transition-colors duration-300">
      {/* ── Sidebar ── */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* ── Main Content Area ── */}
      <motion.div
        animate={{ paddingLeft: collapsed ? 80 : 260 }}
        className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out"
      >
        <Topbar />
        
        <main className="flex-1 p-6 md:p-8 relative">
          {/* ── Ambient Background Glows ── */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 opacity-50" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -z-10 opacity-30" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={user?.id || 'guest'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative z-10"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
};

export default DashboardLayout;
