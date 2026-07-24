const getHealthStatus = (req, res) => {
  res.status(200).json({
    status: "Healthy",
    project: "CloudGuard Free",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getHealthStatus,
};