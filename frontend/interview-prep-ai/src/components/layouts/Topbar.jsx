import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ChevronRight,
  User,
  Menu,
  Camera,
  Trash2,
  Loader2
} from "lucide-react";
import { UserContext } from "../../context/userContext";
import UploadImage from "../../utils/UploadImage";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import { toast } from "react-hot-toast";

const Topbar = ({ collapsed, setCollapsed }) => {
    const { user, setUser } = useContext(UserContext);
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    const dropdownRef = useRef(null);
    const fileInputRef = useRef(null);

    const pathSegments = location.pathname.split("/").filter(Boolean);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectFile = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const uploadRes = await UploadImage(file);
            const imageUrl = uploadRes.imageUrl;

            // Update user profile image on server
            await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE_IMAGE, { profileImageUrl: imageUrl });

            // Update locally in context
            setUser({
                ...user,
                profileImageUrl: imageUrl
            });
            toast.success("Profile picture updated successfully!");
        } catch (error) {
            console.error("Failed to update profile picture:", error);
            toast.error("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
            setDropdownOpen(false);
        }
    };

    const handleRemovePicture = async () => {
        setUploading(true);
        try {
            // Update user profile image on server
            await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE_IMAGE, { profileImageUrl: null });

            // Update locally in context
            setUser({
                ...user,
                profileImageUrl: null
            });
            toast.success("Profile picture removed!");
        } catch (error) {
            console.error("Failed to remove profile picture:", error);
            toast.error("Failed to remove image. Please try again.");
        } finally {
            setUploading(false);
            setDropdownOpen(false);
        }
    };

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
                {pathSegments.length > 0 && pathSegments.map((segment, index) => {
                    // Truncate MongoDB-style hex IDs (24 hex chars)
                    const isHexId = /^[a-f0-9]{24}$/i.test(segment);
                    const displayText = isHexId
                        ? segment.slice(0, 8) + "…"
                        : segment.replace(/-/g, ' ');
                    return (
                        <React.Fragment key={index}>
                            <ChevronRight className="hidden sm:block h-3.5 w-3.5 text-slate-300" />
                            <span className={`text-slate-700 font-semibold capitalize px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] sm:text-xs max-w-[100px] sm:max-w-[180px] truncate ${isHexId ? 'font-mono text-slate-400' : ''}`}>
                                {displayText}
                            </span>
                        </React.Fragment>
                    );
                })}
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

                    <div className="relative" ref={dropdownRef}>
                        <button 
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="h-9 w-9 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center hover:shadow-md transition-all group relative cursor-pointer"
                        >
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

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2.5 w-60 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                {/* Header / User Info */}
                                <div className="px-3 py-2.5 border-b border-slate-100 flex flex-col">
                                    <span className="font-bold text-slate-800 text-sm leading-none truncate">{user?.name || "Guest User"}</span>
                                    <span className="text-slate-500 text-[10px] font-medium mt-1 leading-none truncate">{user?.email || "No email"}</span>
                                </div>

                                <div className="p-1 space-y-0.5">
                                    {/* Action: Change Profile Picture */}
                                    <button 
                                        onClick={handleSelectFile}
                                        disabled={uploading}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all text-left disabled:opacity-50"
                                    >
                                        {uploading ? (
                                            <Loader2 className="h-4 w-4 text-indigo-600 animate-spin" />
                                        ) : (
                                            <Camera className="h-4 w-4 text-slate-400" />
                                        )}
                                        <span>{uploading ? "Uploading..." : "Upload New Photo"}</span>
                                    </button>

                                    {/* Action: Remove Picture */}
                                    {user?.profileImageUrl && (
                                        <button 
                                            onClick={handleRemovePicture}
                                            disabled={uploading}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all text-left disabled:opacity-50"
                                        >
                                            <Trash2 className="h-4 w-4 text-rose-400" />
                                            <span>Remove Photo</span>
                                        </button>
                                    )}
                                </div>

                                {/* Hidden input */}
                                <input 
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
