import { Brain, Sparkles, Activity } from "lucide-react";
import SaaSCard from "./ui/SaaSCard";
import { Badge } from "./ui/Badge";

const SkillSignals = ({ blueprint }) => {

  const skills = blueprint?.skills || [];

  return (
    <SaaSCard className="h-full flex flex-col">
      {/* Unified Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100">
            <Brain size={17} />
          </div>
          <h3 className="text-base sm:text-xl font-black tracking-tight text-slate-900">Skill Signals</h3>
        </div>
        <Badge variant="outline" className="border-indigo-200 text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 sm:px-3 py-1 bg-indigo-50 text-indigo-700">
          Strategic
        </Badge>
      </div>

      <div className="flex-1 space-y-3">
        {skills.map((skill) => (
          <div
            key={skill}
            className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] group-hover:scale-125 transition-transform" />
              <div className="font-black text-sm tracking-tight text-slate-800 group-hover:text-indigo-600 transition-colors">
                {skill}
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-700">
              <Activity size={10} className="text-indigo-500 opacity-100" />
              Calibrating
            </div>
          </div>
        ))}

        {skills.length === 0 && (
           <div className="p-8 text-center text-sm font-medium text-slate-400 italic">
              No skills registered in blueprint.
           </div>
        )}
      </div>
    </SaaSCard>
  );
};

export default SkillSignals;