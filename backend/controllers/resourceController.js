
const { getAzureResources } = require("../services/azureResourceService");

const getResources = async (req, res) => {
  try {
    const scannedResources = await getAzureResources();

    const healthyResources = scannedResources.filter(
      (resource) => resource.securityStatus === "Healthy"
    ).length;

    const atRiskResources = scannedResources.filter(
      (resource) => resource.securityStatus === "At Risk"
    ).length;

    const criticalResources = scannedResources.filter(
      (resource) => resource.riskLevel === "Critical"
    ).length;

    // Calculate the score only from resources supported by the scanner.
    const scannedCount = healthyResources + atRiskResources;

    const totalRiskPoints = scannedResources
      .filter(
        (resource) =>
          resource.securityStatus === "Healthy" ||
          resource.securityStatus === "At Risk"
      )
      .reduce(
        (total, resource) => total + resource.riskPoints,
        0
      );

    const maximumRiskPoints = scannedCount * 100;

    const securityScore =
      maximumRiskPoints === 0
        ? null
        : Math.max(
            0,
            Math.round(
              100 - (totalRiskPoints / maximumRiskPoints) * 100
            )
          );

    res.status(200).json({
      summary: {
        totalResources: scannedResources.length,
        healthyResources,
        atRiskResources,
        criticalResources,
        securityScore,
        notScannedResources: scannedResources.filter(
          (resource) => resource.securityStatus === "Not Scanned"
        ).length,
      },
      resources: scannedResources,
    });
  } catch (error) {
    console.error("Azure resource fetch failed:", error.message);

    res.status(500).json({
      error: "Failed to fetch Azure resources.",
      message: error.message,
    });
  }
};

module.exports = {
  getResources,
};
