import { Briefcase, Clock, Building2 } from "lucide-react";

const CareerTargetBanner = ({ blueprint }) => {

  const role = blueprint?.targetRole || "Role";
  const experience = blueprint?.experienceLevel || "0";
  const companies = blueprint?.companies || [];

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Briefcase size={18} />
            {role}
          </h2>

          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <Clock size={14} />
            {experience} yrs experience
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {companies.map((company) => (
            <span
              key={company}
              className="px-3 py-1 rounded-full bg-muted text-xs flex items-center gap-1"
            >
              <Building2 size={12}/>
              {company}
            </span>
          ))}
        </div>

      </div>

    </div>
  );
};

export default CareerTargetBanner;