import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

import CareerTargetBanner from "../../components/CareerTargetBanner";
import TodaysMissionCard from "../../components/TodaysMissionCard";
import InterviewPath from "../../components/InterviewPath";
import SkillSignals from "../../components/SkillSignals";

const Dashboard2 = () => {

  const [blueprint, setBlueprint] = useState(null);

  useEffect(() => {
    const fetchBlueprint = async () => {
      try {
        const res = await axiosInstance.get("/api/blueprint");
        setBlueprint(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchBlueprint();
  }, []);

  if (!blueprint) return null;

  console.log("Dashboard Blueprint:", blueprint);
  return (
    <div className="min-h-screen bg-background">

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        
        <CareerTargetBanner blueprint={blueprint} />

        <TodaysMissionCard />

        <InterviewPath />

        <SkillSignals blueprint={blueprint} />

      </div>

    </div>
  );
};

export default Dashboard2;