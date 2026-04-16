import { Brain, Sparkles, Activity } from "lucide-react";
import SaaSCard from "./ui/SaaSCard";
import { Badge } from "./ui/Badge";

const SkillSignals = ({ blueprint }) => {

  const skills = blueprint?.skills || [];

  return (
    <SaaSCard className="h-full flex flex-col">
      {/* Unified Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Brain size={20} />
          </div>
          <h3 className="text-xl font-black tracking-tight text-white">Skill Signals</h3>
        </div>
        <Badge variant="outline" className="opacity-60 border-white/10 text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-indigo-500/5 text-indigo-400">
          Strategic
        </Badge>
      </div>

      <div className="flex-1 space-y-3">
        {skills.map((skill) => (
          <div
            key={skill}
            className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.08] border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)] group-hover:scale-125 transition-transform" />
              <div className="font-black text-sm tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                {skill}
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-300 group-hover:text-zinc-100">
              <Activity size={10} className="text-indigo-400 opacity-100" />
              Calibrating
            </div>
          </div>
        ))}

        {skills.length === 0 && (
           <div className="p-8 text-center text-sm font-medium text-zinc-500 italic">
              No skills registered in blueprint.
           </div>
        )}
      </div>
    </SaaSCard>
  );
};

export default SkillSignals;