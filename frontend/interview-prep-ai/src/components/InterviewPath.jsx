import { CheckCircle } from "lucide-react";

const InterviewPath = () => {

  const steps = [
    "Resume Review",
    "Core Fundamentals",
    "System Design",
    "Mock Interview"
  ];

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">

      <h3 className="font-semibold mb-4">
        Interview Path
      </h3>

      <div className="flex gap-4 flex-wrap">

        {steps.map((step) => (
          <div
            key={step}
            className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-sm"
          >
            <CheckCircle size={14} />
            {step}
          </div>
        ))}

      </div>

    </div>
  );
};

export default InterviewPath;