const {
  getAppServiceMetrics,
} = require("../services/azureMonitorService");

const getMetrics = async (
  req,
  res
) => {
  try {
    const subscriptionId =
      process.env.AZURE_SUBSCRIPTION_ID;

    if (!subscriptionId) {
      return res.status(500).json({
        message:
          "AZURE_SUBSCRIPTION_ID is missing.",
      });
    }

    const resourceId =
      `/subscriptions/${subscriptionId}` +
      `/resourceGroups/incidentmanagement-rg` +
      `/providers/Microsoft.Web/sites/incident-management-portal-api`;

    const metrics =
      await getAppServiceMetrics(
        resourceId
      );

    return res.status(200).json({
      ...metrics,

      resource: {
        ...metrics.resource,
        name:
          "incident-management-portal-api",
        type:
          "App Service",
        resourceGroup:
          "incidentmanagement-rg",
      },
    });
  } catch (error) {
    console.error(
      "Azure Monitor metrics error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to retrieve Azure Monitor metrics.",

      error:
        error.message,
    });
  }
};

module.exports = {
  getMetrics,
};