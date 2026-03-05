const SkillSignals = ({ blueprint }) => {

  const skills = blueprint?.skills || [];

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">

      <h3 className="font-semibold mb-4">
        Skill Signals
      </h3>

      <div className="grid grid-cols-3 gap-4">

        {skills.map((skill) => (
          <div
            key={skill}
            className="rounded-xl border p-4 text-center"
          >
            <div className="font-medium">{skill}</div>
            <div className="text-xs text-muted-foreground">
              Practicing
            </div>
          </div>
        ))}

      </div>

    </div>
  );
};

export default SkillSignals;