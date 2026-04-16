import React from "react"
import { LuTrash2 } from "react-icons/lu";
import { motion } from "framer-motion";
import { getInitials } from "../../utils/Helper";
import { Sparkles, Clock, Target, Calendar } from "lucide-react";


const SummaryCard = ({
    colors,
    role,
    topicsToFocus,
    experience,
    questions,
    description,
    lastUpdated,
    onSelect,
    onDelete,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, transition: { duration: 0.3 } }}
            onClick={onSelect}
            className="group relative cursor-pointer"
        >
            {/* ── Outer Glow & Deep Glass Layer ── */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl -z-10 rounded-[32px]" />
            
            <div className="h-full overflow-hidden rounded-[32px] border border-white/10 bg-[#09090b]/95 p-1 backdrop-blur-3xl transition-all duration-500 hover:border-indigo-500/30 shadow-2xl ring-1 ring-white/5">
                
                {/* ── Top Header Section (Deep Gradient Accent) ── */}
                <div 
                    className="relative overflow-hidden rounded-[28px] p-8"
                    style={{
                        background: colors?.bgcolor || `linear-gradient(135deg, rgba(79,70,229,0.15), transparent)`,
                    }}
                >
                    {/* Abstract Blue/Purple Pulse Light */}
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-[50px] pointer-events-none animate-pulse" />
                    <div className="absolute -left-10 -bottom-10 h-24 w-24 rounded-full bg-purple-500/10 blur-[40px] pointer-events-none" />
                    
                    <div className="flex items-center gap-6 relative z-10">
                        {/* Initials Avatar (High-Contrast Gradient) */}
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 shadow-2xl backdrop-blur-md">
                            <span className="text-2xl font-black italic tracking-tighter text-white drop-shadow-lg">
                                {getInitials(role)}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400/80">Intelligence Directive</span>
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-white leading-none drop-shadow-lg">{role}</h2>
                        </div>
                    </div>

                    {/* Delete Toggle */}
                    {onDelete && (
                        <button 
                            className="absolute right-6 top-6 h-10 w-10 flex items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-rose-500 hover:text-white shadow-lg"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                        >
                            <LuTrash2 className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* ── Content Body Section ── */}
                <div className="space-y-6 p-7">
                    {/* Metadata Pills (High Contrast) */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-100 transition-colors group-hover:border-indigo-500/20 group-hover:bg-indigo-500/5">
                            <Target className="h-3 w-3 text-indigo-400" />
                            {experience} {experience == 1 ? "YR" : "YRS"} EXP
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-100 transition-colors group-hover:border-purple-500/20 group-hover:bg-purple-500/5">
                            <Clock className="h-3 w-3 text-purple-400" />
                            {questions} ARTIFACTS
                        </div>
                    </div>

                    {/* Description Insight */}
                    <div className="space-y-3">
                         <div className="h-px bg-gradient-to-r from-indigo-500/20 via-zinc-800 to-transparent w-full" />
                         <p className="text-sm font-bold text-zinc-200/90 leading-relaxed line-clamp-2">
                            {description || "Strategic roadmap containing surgical technical deep-dives and video simulations."}
                        </p>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            <Calendar className="h-3 w-3 opacity-60" />
                            Updated {lastUpdated}
                        </div>
                        <div className="h-8 w-8 rounded-full border border-indigo-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 duration-500">
                             <Target className="h-4 w-4 text-indigo-400" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
};

export default SummaryCard;