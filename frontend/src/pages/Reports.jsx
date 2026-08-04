import { useEffect, useMemo, useState } from "react";
import ReportBar from "../components/ReportBar";
import TopRiskTable from "../components/TopRiskTable";
import {
  downloadFindingsCsv,
  getSecurityReport,
} from "../services/api";

function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadReport = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getSecurityReport();

        if (!cancelled) {
          setReport(data);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.message ||
              "Unable to load the security report."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadReport();

    return () => {
      cancelled = true;
    };
  }, []);

  const maximumSeverityCount = useMemo(() => {
    if (!report?.severityBreakdown) {
      return 1;
    }

    return Math.max(
      1,
      ...Object.values(report.severityBreakdown)
    );
  }, [report]);

  const maximumIncidentCount = useMemo(() => {
    if (!report?.incidentStatusBreakdown) {
      return 1;
    }

    return Math.max(
      1,
      ...Object.values(report.incidentStatusBreakdown)
    );
  }, [report]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setError("");
      setMessage("");

      await downloadFindingsCsv();

      setMessage("Findings CSV downloaded successfully.");
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to download the findings CSV."
      );
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <main className="dashboard">
        <article className="panel">
          <div className="empty-state">
            <h3>Generating security report...</h3>
            <p>CloudGuard is calculating report analytics.</p>
          </div>
        </article>
      </main>
    );
  }

  if (error && !report) {
    return (
      <main className="dashboard">
        <article className="panel">
          <div className="empty-state">
            <h3>Unable to load report</h3>
            <p>{error}</p>
          </div>
        </article>
      </main>
    );
  }

  return (
    <main className="dashboard reports-page">
      <header className="dashboard-header report-page-header">
        <div>
          <p className="eyebrow">Security Analytics</p>
          <h1>Reports</h1>

          <span>
            Review cloud security posture, findings and incident
            performance.
          </span>
        </div>

        <div className="report-actions no-print">
          <button
            type="button"
            className="secondary-button"
            onClick={handlePrint}
          >
            Print Report
          </button>

          <button
            type="button"
            className="primary-button"
            disabled={downloading}
            onClick={handleDownload}
          >
            {downloading ? "Downloading..." : "Download Findings CSV"}
          </button>
        </div>
      </header>

      {(message || error) && (
        <div
          className={`feedback-banner no-print ${
            error ? "error" : "success"
          }`}
        >
          {error || message}
        </div>
      )}

      <section className="report-metadata panel">
        <div>
          <span>Report</span>
          <strong>CloudGuard Security Report</strong>
        </div>

        <div>
          <span>Generated At</span>
          <strong>
            {report?.generatedAt
              ? new Date(report.generatedAt).toLocaleString()
              : "—"}
          </strong>
        </div>

        <div>
          <span>Environment</span>
          <strong>CloudGuard Free</strong>
        </div>
      </section>

      <section className="stats-grid report-overview-grid">
        <article className="stat-card">
          <p className="stat-title">Security Score</p>
          <h3>{report?.overview?.securityScore ?? 0}%</h3>
          <span>Overall security posture</span>
        </article>

        <article className="stat-card">
          <p className="stat-title">Resources</p>
          <h3>{report?.overview?.totalResources ?? 0}</h3>
          <span>Resources evaluated</span>
        </article>

        <article className="stat-card">
          <p className="stat-title">Findings</p>
          <h3>{report?.overview?.totalFindings ?? 0}</h3>
          <span>Security risks detected</span>
        </article>

        <article className="stat-card">
          <p className="stat-title">Alerts</p>
          <h3>{report?.overview?.totalAlerts ?? 0}</h3>
          <span>Generated alerts</span>
        </article>

        <article className="stat-card">
          <p className="stat-title">Incidents</p>
          <h3>{report?.overview?.totalIncidents ?? 0}</h3>
          <span>Investigation cases</span>
        </article>

        <article className="stat-card">
          <p className="stat-title">Activities</p>
          <h3>{report?.overview?.totalActivities ?? 0}</h3>
          <span>Audit events recorded</span>
        </article>
      </section>

      <section className="reports-grid">
        <article className="panel report-chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Findings by Severity</h2>
              <p>Security findings grouped by risk severity.</p>
            </div>
          </div>

          <div className="report-bars">
            <ReportBar
              label="Critical"
              value={report?.severityBreakdown?.Critical ?? 0}
              maximum={maximumSeverityCount}
              variant="critical"
            />

            <ReportBar
              label="High"
              value={report?.severityBreakdown?.High ?? 0}
              maximum={maximumSeverityCount}
              variant="high"
            />

            <ReportBar
              label="Medium"
              value={report?.severityBreakdown?.Medium ?? 0}
              maximum={maximumSeverityCount}
              variant="medium"
            />

            <ReportBar
              label="Low"
              value={report?.severityBreakdown?.Low ?? 0}
              maximum={maximumSeverityCount}
              variant="low"
            />
          </div>
        </article>

        <article className="panel report-chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Incident Status</h2>
              <p>Current incident-response lifecycle distribution.</p>
            </div>
          </div>

          <div className="report-bars">
            <ReportBar
              label="Open"
              value={report?.incidentStatusBreakdown?.Open ?? 0}
              maximum={maximumIncidentCount}
              variant="critical"
            />

            <ReportBar
              label="In Progress"
              value={
                report?.incidentStatusBreakdown?.["In Progress"] ?? 0
              }
              maximum={maximumIncidentCount}
              variant="medium"
            />

            <ReportBar
              label="Resolved"
              value={report?.incidentStatusBreakdown?.Resolved ?? 0}
              maximum={maximumIncidentCount}
              variant="default"
            />

            <ReportBar
              label="Closed"
              value={report?.incidentStatusBreakdown?.Closed ?? 0}
              maximum={maximumIncidentCount}
              variant="low"
            />
          </div>
        </article>
      </section>

      <section className="reports-grid">
        <article className="panel report-summary-panel">
          <h2>Resource Posture</h2>

          <div className="system-row">
            <span>Healthy Resources</span>
            <strong>
              {report?.resourceSummary?.healthyResources ?? 0}
            </strong>
          </div>

          <div className="system-row">
            <span>At-Risk Resources</span>
            <strong>
              {report?.resourceSummary?.atRiskResources ?? 0}
            </strong>
          </div>

          <div className="system-row">
            <span>Critical Resources</span>
            <strong>
              {report?.resourceSummary?.criticalResources ?? 0}
            </strong>
          </div>
        </article>

        <article className="panel report-summary-panel">
          <h2>Alert Posture</h2>

          <div className="system-row">
            <span>Active Alerts</span>
            <strong>{report?.alertSummary?.activeAlerts ?? 0}</strong>
          </div>

          <div className="system-row">
            <span>Acknowledged Alerts</span>
            <strong>
              {report?.alertSummary?.acknowledgedAlerts ?? 0}
            </strong>
          </div>

          <div className="system-row">
            <span>Resolved Alerts</span>
            <strong>{report?.alertSummary?.resolvedAlerts ?? 0}</strong>
          </div>
        </article>
      </section>

      <article className="panel top-risk-panel">
        <div className="panel-heading">
          <div>
            <h2>Top-Risk Resources</h2>
            <p>
              Resources requiring the highest remediation priority.
            </p>
          </div>
        </div>

        <TopRiskTable
          resources={report?.topRiskResources || []}
        />
      </article>
    </main>
  );
}

export default Reports;