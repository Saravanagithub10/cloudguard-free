const {
  buildActivityLogs,
  buildActivitySummary,
} = require("../services/activityService");

const getActivities = (req, res) => {
  const activities = buildActivityLogs();

  return res.status(200).json({
    summary: buildActivitySummary(activities),
    activities,
  });
};

const getActivityById = (req, res) => {
  const activities = buildActivityLogs();

  const activity = activities.find(
    (item) => item.id === req.params.id
  );

  if (!activity) {
    return res.status(404).json({
      message: "Activity log not found.",
    });
  }

  return res.status(200).json(activity);
};

module.exports = {
  getActivities,
  getActivityById,
};