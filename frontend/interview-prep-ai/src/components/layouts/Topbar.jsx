import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ChevronRight,
  User,
  Menu
} from "lucide-react";
import { UserContext } from "../../context/userContext";

const Topbar = ({ collapsed, setCollapsed }) => {
    const { user } = useContext(UserContext);
    const location = useLocation();

    const pathSegments = location.pathname.split("/").filter(Boolean);
    
    return (
        <header className="h-16 border-b border-slate-200 bg-[#FFFFFF]/80 backdrop-blur-xl sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between shadow-sm">
            {/* ── Left Side (Menu Toggle + Breadcrumbs) ── */}
            <div className="flex items-center gap-2 md:gap-4 text-sm">
                <button 
                  onClick={() => setCollapsed(!collapsed)}
                  className="md:hidden p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <span className="hidden sm:inline-block text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] px-2 py-1">
                    InterviewAI
                </span>
                {pathSegments.length > 0 && pathSegments.map((segment, index) => (
                    <React.Fragment key={index}>
                        <ChevronRight className="hidden sm:block h-4 w-4 text-slate-300" />
                        <span className="text-slate-700 font-semibold capitalize px-2 sm:px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm">
                            {segment.replace(/-/g, ' ')}
                        </span>
                    </React.Fragment>
                ))}
            </div>

            <div className="flex-1" />


            {/* ── Right Actions ── */}
            <div className="flex items-center gap-4">
                <div className="h-6 w-px bg-slate-200 mx-1" />

                <div className="flex items-center gap-3 pl-2">
                    <div className="hidden lg:flex flex-col items-end text-xs">
                        <span className="font-bold text-slate-800 leading-none">{user?.name || "Guest User"}</span>
                        <span className="text-slate-500 mt-1 font-medium">{user?.email || "No email"}</span>
                    </div>
                    <button className="h-9 w-9 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center hover:shadow-sm transition-all group relative">
                        {/* Initials shown instantly as background */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-black rounded-xl">
                            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                        </div>
                        {/* Image loads on top — hides initials once ready */}
                        {user?.profileImageUrl && (
                            <img
                                src={user.profileImageUrl}
                                alt="Profile"
                                className="absolute inset-0 w-full h-full object-cover rounded-xl z-10"
                                loading="eager"
                                fetchPriority="high"
                                referrerPolicy="no-referrer"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
