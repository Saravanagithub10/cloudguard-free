const sendSecurityAlertEmail = async (alert) => {
  const logicAppUrl = process.env.LOGIC_APP_EMAIL_URL;

  if (!logicAppUrl) {
    throw new Error(
      "LOGIC_APP_EMAIL_URL is missing in environment variables."
    );
  }

  const payload = {
    alertId: alert.id,
    severity: alert.severity,
    finding: alert.title,
    resourceName: alert.resourceName,
    resourceType: alert.resourceType,
    resourceGroup: alert.resourceGroup,
    region: alert.region,
    recommendation: alert.recommendation,
    riskPoints: alert.riskPoints,
  };

  const response = await fetch(logicAppUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const responseText = await response.text();

    throw new Error(
      `Logic App notification failed (${response.status}): ${responseText}`
    );
  }

  return true;
};

module.exports = {
  sendSecurityAlertEmail,
};