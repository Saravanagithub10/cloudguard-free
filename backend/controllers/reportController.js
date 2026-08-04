const {
  buildSecurityReport,
} = require("../services/reportService");

const getSecurityReport = (req, res) => {
  const report = buildSecurityReport();

  return res.status(200).json(report);
};

const downloadFindingsCsv = (req, res) => {
  const report = buildSecurityReport();

  const escapeCsvValue = (value) => {
    const stringValue = String(value ?? "");

    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  };

  const headers = [
    "Rule ID",
    "Finding",
    "Severity",
    "Resource",
    "Resource Type",
    "Resource Group",
    "Region",
    "Risk Points",
    "Recommendation",
  ];

  const rows = report.findings.map((finding) => [
    finding.ruleId,
    finding.title,
    finding.severity,
    finding.resourceName,
    finding.resourceType,
    finding.resourceGroup,
    finding.region,
    finding.points,
    finding.recommendation,
  ]);

  const csv = [
    headers,
    ...rows,
  ]
    .map((row) =>
      row.map(escapeCsvValue).join(",")
    )
    .join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
res.setHeader(
  "Content-Disposition",
  'attachment; filename="cloudguard-findings-report.csv"'
);
res.setHeader("Content-Length", Buffer.byteLength(csv, "utf8"));

return res.status(200).send(csv);
};

module.exports = {
  getSecurityReport,
  downloadFindingsCsv,
};