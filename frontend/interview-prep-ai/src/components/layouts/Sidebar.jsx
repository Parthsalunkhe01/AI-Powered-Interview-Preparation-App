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
    <div className={`sidebar-item group ${active ? 'bg-[#EEF2FF]' : 'hover:bg-slate-50'}`}>
      <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-300 ${active ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50/50'}`}>
        <Icon className={`h-4.5 w-4.5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
      </div>
      {!collapsed && (
        <motion.span 
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className={`truncate font-bold tracking-tight text-sm ${active ? 'text-[#0F172A]' : 'text-slate-500 group-hover:text-[#0F172A]'}`}
        >
          {label}
        </motion.span>
      )}
      {active && !collapsed && (
        <motion.div 
            layoutId="sidebar-active-indicator"
            className="ml-auto w-1 h-4 rounded-full bg-indigo-600"
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
      className="fixed left-0 top-0 h-screen bg-[#FFFFFF] border-r border-slate-200 z-50 flex flex-col pt-6 pb-8 transition-all duration-300 ease-in-out overflow-hidden shadow-sm"
    >
      {/* ── Logo ── */}
      <div className={`px-6 mb-10 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0 shadow-sm">
          <Zap className="h-5 w-5 text-white fill-white" />
        </div>
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-black text-xl tracking-tighter text-slate-800"
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
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all group ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          {!collapsed && <span>Logout</span>}
        </button>

        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all ${collapsed ? 'justify-center' : ''}`}
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
