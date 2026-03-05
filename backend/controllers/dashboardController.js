const Blueprint = require("../models/InterviewBlueprint");

exports.getDashboard = async (req, res) => {

  const blueprint = await Blueprint.findOne({
    user: req.user.id
  });

  res.json({
    blueprint,
    signals: [],
    progress: {}
  });

};