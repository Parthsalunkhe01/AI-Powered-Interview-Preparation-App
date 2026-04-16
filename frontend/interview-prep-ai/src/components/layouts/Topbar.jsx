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
        <header className="h-16 border-b border-white/5 bg-[#09090b]/50 backdrop-blur-xl sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
            {/* ── Breadcrumbs ── */}
            <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px] opacity-40 px-2 py-1">
                    Intelligence Platform
                </span>
                {pathSegments.length > 0 && pathSegments.map((segment, index) => (
                    <React.Fragment key={index}>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                        <span className="text-foreground font-semibold capitalize px-2.5 py-1 bg-primary/5 border border-primary/10 rounded-lg">
                            {segment.replace(/-/g, ' ')}
                        </span>
                    </React.Fragment>
                ))}
            </div>

            <div className="flex-1" />


            {/* ── Right Actions ── */}
            <div className="flex items-center gap-4">
                <div className="h-6 w-px bg-white/5 mx-1" />

                <div className="flex items-center gap-3 pl-2">
                    <div className="hidden lg:flex flex-col items-end text-xs">
                        <span className="font-bold text-foreground leading-none">{user?.name || "Guest User"}</span>
                        <span className="text-muted-foreground mt-1 font-medium">{user?.email || "No email"}</span>
                    </div>
                    <button className="h-9 w-9 rounded-xl overflow-hidden border border-primary/20 bg-primary/10 flex items-center justify-center hover:ring-2 hover:ring-primary/20 transition-all p-1.5 group">
                        {user?.profilePicture ? (
                            <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <User className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
