import { Calendar, Target, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SaaSCard from "./ui/SaaSCard";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/button";

const TodaysMissionCard = ({ sessionLabel = "Session 1" }) => {
  return (
    <SaaSCard className="h-full flex flex-col">
      {/* Unified Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <Calendar size={20} />
          </div>
          <h3 className="text-xl font-black tracking-tight text-white">Today's Mission</h3>
        </div>
        <Badge variant="outline" className="opacity-60 border-white/10 text-[10px] font-black uppercase tracking-widest px-3 py-1">
          {sessionLabel}
        </Badge>
      </div>

      <div className="flex-1 space-y-5">
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 relative overflow-hidden group hover:bg-white/[0.04] transition-all">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
             <Sparkles size={40} className="text-blue-400" />
          </div>
          
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
            <Target size={12} />
            Active Directive
          </div>
          <p className="text-base font-bold leading-relaxed text-zinc-100">
            Complete your daily <span className="text-blue-400 font-black">interview session</span> to synchronize your <span className="text-blue-400 font-black">blueprint data</span> and maintain peak performance.
          </p>
        </div>

        <Link to="/ai-interview/setup" className="block mt-auto">
          <Button className="w-full h-12 gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest text-[11px] shadow-lg hover:shadow-blue-500/20 hover:scale-[1.01] transition-all">
            Initialize Session
            <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
    </SaaSCard>
  );
};

export default TodaysMissionCard;