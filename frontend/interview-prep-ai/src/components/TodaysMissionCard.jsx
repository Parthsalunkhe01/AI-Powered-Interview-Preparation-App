import { Target } from "lucide-react";
import { Link } from "react-router-dom";

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

      <Link to="/ai-interview/setup">
        <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors">
          Start AI Interview
        </button>
      </Link>

    </div>
  );
};

export default TodaysMissionCard;