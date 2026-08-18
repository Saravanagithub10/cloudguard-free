const crypto = require("crypto");
const alerts = require("../data/alertStore");
const {
  getAzureResources,
} = require("./azureResourceService");

const createResourceKey = (resourceId) => {
  return crypto
    .createHash("sha1")
    .update(resourceId)
    .digest("hex")
    .slice(0, 8);
};

const createAlertId = (resource, finding) => {
  const resourceKey = createResourceKey(resource.id);

  return `ALT-${resourceKey}-${finding.ruleId}`;
};

const buildAlertFromFinding = (
  resource,
  finding
) => {
  const id = createAlertId(resource, finding);

  return {
    id,

    title:
      finding.finding ||
      finding.title ||
      "Security finding",

    severity:
      finding.severity || "Low",

    resourceId:
      resource.id,

    resourceName:
      resource.name,

    resourceType:
      resource.type,

    resourceGroup:
      resource.resourceGroup,

    region:
      resource.region,

    azureType:
      resource.azureType,

    status: "Active",

    recommendation:
      finding.recommendation ||
      "Review the detected security configuration.",

    riskPoints:
      finding.riskPoints ??
      finding.points ??
      0,

    ruleId:
      finding.ruleId,

    source:
      "Azure Resource Graph",

    createdAt:
      new Date().toISOString(),

    acknowledgedAt:
      null,

    resolvedAt:
      null,

    resolutionNote:
      "",

    activity: [],
  };
};

const synchronizeAzureAlerts = async () => {
  const resources = await getAzureResources();

  const generatedAlerts = resources.flatMap(
    (resource) => {
      const findings = Array.isArray(
        resource.findings
      )
        ? resource.findings
        : [];

      return findings.map((finding) =>
        buildAlertFromFinding(
          resource,
          finding
        )
      );
    }
  );

  const synchronizedAlerts =
    generatedAlerts.map((generatedAlert) => {
      const existingAlert = alerts.find(
        (alert) =>
          alert.id === generatedAlert.id
      );

      // Existing alert found:
      // preserve analyst workflow state.
      if (existingAlert) {
        return {
          ...generatedAlert,

          status:
            existingAlert.status,

          createdAt:
            existingAlert.createdAt,

          acknowledgedAt:
            existingAlert.acknowledgedAt,

          resolvedAt:
            existingAlert.resolvedAt,

          resolutionNote:
            existingAlert.resolutionNote,

          activity:
            Array.isArray(
              existingAlert.activity
            )
              ? existingAlert.activity
              : [],
        };
      }

      const timestamp =
        generatedAlert.createdAt;

      return {
        ...generatedAlert,

        activity: [
          {
            action: "Created",

            message:
              "Alert generated from a live Azure security finding.",

            timestamp,
          },
        ],
      };
    });

  // Important:
  // mutate the same exported array instead of
  // replacing it, because other modules require
  // this exact array reference.
  alerts.splice(
    0,
    alerts.length,
    ...synchronizedAlerts
  );

  return alerts;
};

module.exports = {
  synchronizeAzureAlerts,
};