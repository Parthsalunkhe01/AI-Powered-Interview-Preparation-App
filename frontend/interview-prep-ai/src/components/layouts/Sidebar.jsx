import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  BarChart2, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Zap,
  Briefcase
} from "lucide-react";
import { useContext } from "react";
import { UserContext } from "../../context/userContext";

const SidebarItem = ({ icon: Icon, label, path, active, collapsed }) => (
  <Link to={path} className="block no-underline">
    <div className={`sidebar-item group ${active ? 'sidebar-item-active ring-1 ring-white/10' : 'sidebar-item-inactive'}`}>
      <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-300 ${active ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'group-hover:bg-white/5'}`}>
        <Icon className={`h-4.5 w-4.5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
      </div>
      {!collapsed && (
        <motion.span 
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className={`truncate font-bold tracking-tight text-sm ${active ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}
        >
          {label}
        </motion.span>
      )}
      {active && !collapsed && (
        <motion.div 
            layoutId="sidebar-active-indicator"
            className="ml-auto w-1 h-4 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]"
        />
      )}
    </div>
  </Link>
);

const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const { clearUser } = useContext(UserContext);

  const mainLinks = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Analytics", path: "/analytics", icon: BarChart2 },
    { label: "Resources", path: "/resources", icon: BookOpen },
    { label: "Blueprints", path: "/blueprint", icon: Briefcase },
  ];

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      className="fixed left-0 top-0 h-screen bg-[#0d0d0f] border-r border-white/5 z-50 flex flex-col pt-6 pb-8 transition-all duration-300 ease-in-out overflow-hidden"
    >
      {/* ── Logo ── */}
      <div className={`px-6 mb-10 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <Zap className="h-5 w-5 text-white fill-white" />
        </div>
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-black text-xl tracking-tighter"
          >
            AI-powered Interview Prep
          </motion.div>
        )}
      </div>

      {/* ── Main Navigation ── */}
      <div className="flex-1 px-4 space-y-1 overflow-y-auto">
        {mainLinks.map((link) => (
          <SidebarItem 
            key={link.path} 
            {...link} 
            active={location.pathname === link.path}
            collapsed={collapsed}
          />
        ))}
      </div>

      {/* ── Bottom Section ── */}
      <div className="px-4 space-y-2">
        <button 
          onClick={() => { clearUser(); }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-500/70 hover:text-rose-400 hover:bg-rose-500/5 transition-all group ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          {!collapsed && <span>Logout</span>}
        </button>

        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse Sidebar</span>
              </>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
