const crypto = require("crypto");

const alerts = require("../data/alertStore");

const {
  getAzureResources,
} = require("./azureResourceService");

const {
  sendSecurityAlertEmail,
} = require("./notificationService");

const {
  getAlertState,
  saveAlertsState,
} = require("./alertStateService");

const createResourceKey = (resourceId) => {
  return crypto
    .createHash("sha1")
    .update(resourceId)
    .digest("hex")
    .slice(0, 8);
};

const createAlertId = (
  resource,
  finding
) => {
  const resourceKey =
    createResourceKey(
      resource.id
    );

  return `ALT-${resourceKey}-${finding.ruleId}`;
};

const buildAlertFromFinding = (
  resource,
  finding
) => {
  const id =
    createAlertId(
      resource,
      finding
    );

  return {
    id,

    title:
      finding.finding ||
      finding.title ||
      "Security finding",

    severity:
      finding.severity ||
      "Low",

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

    status:
      "Active",

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

    emailNotificationSent:
      false,

    emailNotifiedAt:
      null,

    notificationError:
      null,

    activity:
      [],
  };
};

const shouldSendEmail = (
  alert
) => {
  return (
    alert.severity === "High" ||
    alert.severity === "Critical"
  );
};

const mergeSavedState = (
  generatedAlert
) => {
  const savedState =
    getAlertState(
      generatedAlert.id
    );

  if (!savedState) {
    return null;
  }

  return {
    ...generatedAlert,

    status:
      savedState.status ||
      generatedAlert.status,

    createdAt:
      savedState.createdAt ||
      generatedAlert.createdAt,

    acknowledgedAt:
      savedState.acknowledgedAt ??
      null,

    resolvedAt:
      savedState.resolvedAt ??
      null,

    resolutionNote:
      savedState.resolutionNote ||
      "",

    emailNotificationSent:
      savedState.emailNotificationSent ??
      false,

    emailNotifiedAt:
      savedState.emailNotifiedAt ??
      null,

    notificationError:
      savedState.notificationError ??
      null,

    activity:
      Array.isArray(
        savedState.activity
      )
        ? savedState.activity
        : [],
  };
};

const synchronizeAzureAlerts = async () => {
  const resources =
    await getAzureResources();

  const generatedAlerts =
    resources.flatMap(
      (resource) => {
        const findings =
          Array.isArray(
            resource.findings
          )
            ? resource.findings
            : [];

        return findings.map(
          (finding) =>
            buildAlertFromFinding(
              resource,
              finding
            )
        );
      }
    );

  const synchronizedAlerts =
    [];

  for (
    const generatedAlert
    of generatedAlerts
  ) {
    const existingAlert =
      alerts.find(
        (alert) =>
          alert.id ===
          generatedAlert.id
      );

    let alert;

    if (existingAlert) {
      alert = {
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

        emailNotificationSent:
          existingAlert.emailNotificationSent ??
          false,

        emailNotifiedAt:
          existingAlert.emailNotifiedAt ??
          null,

        notificationError:
          existingAlert.notificationError ??
          null,

        activity:
          Array.isArray(
            existingAlert.activity
          )
            ? existingAlert.activity
            : [],
      };
    } else {
      const persistedAlert =
        mergeSavedState(
          generatedAlert
        );

      if (persistedAlert) {
        alert =
          persistedAlert;
      } else {
        const timestamp =
          generatedAlert.createdAt;

        alert = {
          ...generatedAlert,

          activity: [
            {
              action:
                "Created",

              message:
                "Alert generated from a live Azure security finding.",

              timestamp,
            },
          ],
        };
      }
    }

    if (
      shouldSendEmail(alert) &&
      !alert.emailNotificationSent
    ) {
      try {
        await sendSecurityAlertEmail(
          alert
        );

        const timestamp =
          new Date().toISOString();

        alert.emailNotificationSent =
          true;

        alert.emailNotifiedAt =
          timestamp;

        alert.notificationError =
          null;

        alert.activity.push({
          action:
            "Email Notification Sent",

          message:
            "High-severity security alert notification sent by email.",

          timestamp,
        });
      } catch (error) {
        console.error(
          `Email notification failed for ${alert.id}:`,
          error.message
        );

        alert.notificationError =
          error.message;

        alert.activity.push({
          action:
            "Email Notification Failed",

          message:
            error.message,

          timestamp:
            new Date().toISOString(),
        });
      }
    }

    synchronizedAlerts.push(
      alert
    );
  }

  alerts.splice(
    0,
    alerts.length,
    ...synchronizedAlerts
  );

  saveAlertsState(
    synchronizedAlerts
  );

  return alerts;
};

module.exports = {
  synchronizeAzureAlerts,
};