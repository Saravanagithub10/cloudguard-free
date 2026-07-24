const resources = require("../data/resources");
const { scanResources } = require("../services/resourceScanner");

const getResources = (req, res) => {
  const scannedResources = scanResources(resources);

  const totalRiskPoints = scannedResources.reduce(
    (total, resource) => total + resource.riskPoints,
    0
  );

  const maximumRiskPoints = scannedResources.length * 100;

  const securityScore =
    maximumRiskPoints === 0
      ? 100
      : Math.max(
          0,
          Math.round(100 - (totalRiskPoints / maximumRiskPoints) * 100)
        );

  const summary = {
    totalResources: scannedResources.length,
    healthyResources: scannedResources.filter(
      (resource) => resource.securityStatus === "Healthy"
    ).length,
    atRiskResources: scannedResources.filter(
      (resource) => resource.securityStatus === "At Risk"
    ).length,
    criticalResources: scannedResources.filter(
      (resource) => resource.riskLevel === "Critical"
    ).length,
    securityScore,
  };

  res.status(200).json({
    summary,
    resources: scannedResources,
  });
};

module.exports = {
  getResources,
};