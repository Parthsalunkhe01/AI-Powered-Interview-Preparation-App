import { Target } from "lucide-react";

const TodaysMissionCard = () => {

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">

      <h3 className="font-semibold flex items-center gap-2 mb-3">
        <Target size={18} />
        Today's Mission
      </h3>

      <div className="text-sm text-muted-foreground">
        Complete 1 interview session based on your blueprint.
      </div>

      <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm">
        Start Interview
      </button>

    </div>
  );
};

export default TodaysMissionCard;