import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ChevronRight,
  User
} from "lucide-react";
import { UserContext } from "../../context/userContext";

const Topbar = () => {
    const { user } = useContext(UserContext);
    const location = useLocation();

    const pathSegments = location.pathname.split("/").filter(Boolean);
    
    return (
        <header className="h-16 border-b border-slate-200 bg-[#FFFFFF]/80 backdrop-blur-xl sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
            {/* ── Breadcrumbs ── */}
            <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] px-2 py-1">
                    Intelligence Platform
                </span>
                {pathSegments.length > 0 && pathSegments.map((segment, index) => (
                    <React.Fragment key={index}>
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                        <span className="text-slate-700 font-semibold capitalize px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
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
                    <button className="h-9 w-9 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center hover:shadow-sm transition-all p-1.5 group">
                        {user?.profilePicture ? (
                            <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <User className="h-5 w-5 text-slate-400 group-hover:scale-110 group-hover:text-indigo-600 transition-all" />
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
