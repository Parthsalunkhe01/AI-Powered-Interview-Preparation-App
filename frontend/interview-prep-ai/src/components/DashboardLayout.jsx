import React, { useState } from "react";
import Sidebar from "./layouts/Sidebar";
import Topbar from "./layouts/Topbar";
import { UserContext } from "../context/userContext";
import { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";


const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { user } = useContext(UserContext);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && !collapsed) {
        setCollapsed(true);
      } else if (!mobile && collapsed) {
        // Option to expand when resizing back, but let's keep it collapsed if it was
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [collapsed]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-800 transition-colors duration-300">
      {/* ── Overlay for mobile when sidebar is open ── */}
      {isMobile && !collapsed && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* ── Sidebar ── */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} isMobile={isMobile} />

      {/* ── Main Content Area ── */}
      <motion.div
        animate={{ paddingLeft: isMobile ? 0 : (collapsed ? 80 : 260) }}
        className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out relative z-10 w-full"
      >
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 relative overflow-x-hidden">
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
