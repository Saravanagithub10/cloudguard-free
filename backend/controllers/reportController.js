const {
  buildSecurityReport,
} = require("../services/reportService");

// ========================================
// GET SECURITY REPORT
// ========================================

const getSecurityReport = async (
  req,
  res
) => {
  try {
    const report =
      await buildSecurityReport();

    return res.status(200).json(
      report
    );
  } catch (error) {
    console.error(
      "Unable to generate security report:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to generate live Azure security report.",

      error:
        error.message,
    });
  }
};

// ========================================
// DOWNLOAD FINDINGS CSV
// ========================================

const downloadFindingsCsv = async (
  req,
  res
) => {
  try {
    const report =
      await buildSecurityReport();

    const escapeCsvValue = (
      value
    ) => {
      const stringValue =
        String(value ?? "");

      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
      ) {
        return `"${stringValue.replace(
          /"/g,
          '""'
        )}"`;
      }

      return stringValue;
    };

    const headers = [
      "Rule ID",
      "Finding",
      "Severity",
      "Resource",
      "Resource Type",
      "Azure Type",
      "Resource Group",
      "Region",
      "Risk Points",
      "Recommendation",
      "Source",
    ];

    const rows =
      report.findings.map(
        (finding) => [
          finding.ruleId,
          finding.finding,
          finding.severity,
          finding.resourceName,
          finding.resourceType,
          finding.azureType,
          finding.resourceGroup,
          finding.region,
          finding.riskPoints ??
            finding.points ??
            0,
          finding.recommendation,
          finding.source,
        ]
      );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(escapeCsvValue)
          .join(",")
      )
      .join("\n");

    res.setHeader(
      "Content-Type",
      "text/csv; charset=utf-8"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="cloudguard-azure-findings-report.csv"'
    );

    res.setHeader(
      "Content-Length",
      Buffer.byteLength(
        csv,
        "utf8"
      )
    );

    return res
      .status(200)
      .send(csv);
  } catch (error) {
    console.error(
      "Unable to generate CSV report:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to generate Azure findings CSV.",

      error:
        error.message,
    });
  }
};

module.exports = {
  getSecurityReport,
  downloadFindingsCsv,
};