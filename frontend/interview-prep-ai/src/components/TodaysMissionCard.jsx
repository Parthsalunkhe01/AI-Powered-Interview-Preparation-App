import { Calendar, Target, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SaaSCard from "./ui/SaaSCard";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

const TodaysMissionCard = ({ sessionLabel = "Session 1" }) => {
  return (
    <SaaSCard className="h-full flex flex-col">
      {/* Unified Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
            <Calendar size={20} />
          </div>
          <h3 className="text-xl font-black tracking-tight text-slate-900">Today's Mission</h3>
        </div>
        <Badge variant="outline" className="border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest px-3 py-1">
          {sessionLabel}
        </Badge>
      </div>

      <div className="flex-1 space-y-5">
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 relative overflow-hidden group hover:bg-white hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
             <Sparkles size={40} className="text-blue-500" />
          </div>
          
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
            <Target size={12} />
            Active Directive
          </div>
          <p className="text-base font-bold leading-relaxed text-slate-700">
            Complete your daily <span className="text-blue-600 font-black">interview session</span> to synchronize your <span className="text-blue-600 font-black">blueprint data</span> and maintain peak performance.
          </p>
        </div>

        <Link to="/ai-interview/setup" className="block mt-auto">
          <Button className="w-full h-12 gap-2 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all">
            Initialize Session
            <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
    </SaaSCard>
  );
};

export default TodaysMissionCard;