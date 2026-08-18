import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import ResourceTable from "../components/ResourceTable";
import FindingDetails from "../components/FindingDetails";
import AlertsTable from "../components/AlertsTable";
import {
  getHealthStatus,
  getResources,
  getAlerts,
} from "../services/api";

function Dashboard() {
  const [health, setHealth] = useState(null);
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);

  const [alerts, setAlerts] = useState([]);
  const [alertSummary, setAlertSummary] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [healthData, resourceData, alertData] =
          await Promise.all([
            getHealthStatus(),
            getResources(),
            getAlerts(),
          ]);

        if (cancelled) {
          return;
        }

        const receivedResources = Array.isArray(
          resourceData?.resources
        )
          ? resourceData.resources
          : [];

        const receivedAlerts = Array.isArray(alertData?.alerts)
          ? alertData.alerts
          : [];

        setHealth(healthData);

        setResources(receivedResources);
        setSelectedResource(receivedResources[0] || null);

        setAlerts(receivedAlerts);
        setAlertSummary(alertData?.summary || null);
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.message ||
              "Unable to load CloudGuard dashboard data."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, []);

  const resourceSummary = useMemo(() => {
    const totalResources = resources.length;

    const scannedResources = resources.filter(
      (resource) =>
        resource.securityStatus !== "Not Scanned"
    ).length;

    const healthyResources = resources.filter(
      (resource) =>
        resource.securityStatus === "Healthy"
    ).length;

    const atRiskResources = resources.filter(
      (resource) =>
        resource.securityStatus === "At Risk"
    ).length;

    const notScannedResources = resources.filter(
      (resource) =>
        resource.securityStatus === "Not Scanned"
    ).length;

    const criticalResources = resources.filter(
      (resource) =>
        resource.riskLevel === "Critical"
    ).length;

    const highRiskResources = resources.filter(
      (resource) =>
        resource.riskLevel === "High"
    ).length;

    const totalFindings = resources.reduce(
      (total, resource) =>
        total +
        (Array.isArray(resource.findings)
          ? resource.findings.length
          : 0),
      0
    );

    const totalRiskPoints = resources.reduce(
      (total, resource) =>
        total + (resource.riskPoints || 0),
      0
    );

    const maximumRiskPoints =
      scannedResources > 0
        ? scannedResources * 100
        : 0;

    const securityScore =
      maximumRiskPoints > 0
        ? Math.max(
            0,
            Math.round(
              100 -
                (totalRiskPoints /
                  maximumRiskPoints) *
                  100
            )
          )
        : 100;

    return {
      totalResources,
      scannedResources,
      healthyResources,
      atRiskResources,
      notScannedResources,
      criticalResources,
      highRiskResources,
      totalFindings,
      totalRiskPoints,
      securityScore,
    };
  }, [resources]);

  const apiStatus = loading
    ? "Checking..."
    : error
      ? "Offline"
      : health?.status || "Unknown";

  const scannedResources = useMemo(
    () =>
      resources.filter(
        (resource) =>
          resource.securityStatus !== "Not Scanned"
      ),
    [resources]
  );

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">
            Security Operations Dashboard
          </p>

          <h1>CloudGuard Overview</h1>

          <span>
            Monitor real Azure resources, security findings
            and incident-response activity.
          </span>
        </div>

        <div
          className={`api-badge ${
            error ? "offline" : ""
          }`}
        >
          <span className="status-dot"></span>
          API: {apiStatus}
        </div>
      </header>

      <section className="stats-grid">
        <StatCard
          title="Security Score"
          value={`${resourceSummary.securityScore}%`}
          description="Calculated from live Azure findings"
        />

        <StatCard
          title="Azure Resources"
          value={resourceSummary.totalResources}
          description={`${resourceSummary.scannedResources} currently scanned`}
        />

        <StatCard
          title="At-Risk Resources"
          value={resourceSummary.atRiskResources}
          description={`${resourceSummary.totalFindings} findings detected`}
        />

        <StatCard
          title="Active Alerts"
          value={alertSummary?.activeAlerts ?? 0}
          description={`${
            alertSummary?.criticalAlerts ?? 0
          } critical alerts`}
        />
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>Azure Security Scan Summary</h2>

              <p>
                Live CloudGuard analysis of resources
                discovered through Azure Resource Graph.
              </p>
            </div>
          </div>

          <div className="empty-state">
            {loading ? (
              <>
                <h3>Scanning Azure resources...</h3>

                <p>
                  CloudGuard is retrieving resources and
                  evaluating supported security rules.
                </p>
              </>
            ) : error ? (
              <>
                <h3>Scan unavailable</h3>
                <p>{error}</p>
              </>
            ) : (
              <>
                <h3>
                  {resourceSummary.atRiskResources} resources
                  need attention
                </h3>

                <p>
                  Security score:{" "}
                  {resourceSummary.securityScore}%
                </p>

                <p>
                  Findings detected:{" "}
                  {resourceSummary.totalFindings}
                </p>
              </>
            )}
          </div>
        </article>

        <article className="panel system-panel">
          <div className="panel-heading">
            <div>
              <h2>System Information</h2>

              <p>
                CloudGuard service and Azure scan status.
              </p>
            </div>
          </div>

          <div className="system-row">
            <span>Project</span>
            <strong>
              {health?.project || "CloudGuard Free"}
            </strong>
          </div>

          <div className="system-row">
            <span>Version</span>
            <strong>{health?.version || "—"}</strong>
          </div>

          <div className="system-row">
            <span>Environment</span>
            <strong>
              {health?.environment || "—"}
            </strong>
          </div>

          <div className="system-row">
            <span>Data Source</span>
            <strong>Azure Resource Graph</strong>
          </div>

          <div className="system-row">
            <span>Scanned Resources</span>
            <strong>
              {resourceSummary.scannedResources}
            </strong>
          </div>

          <div className="system-row">
            <span>Not Scanned</span>
            <strong>
              {resourceSummary.notScannedResources}
            </strong>
          </div>

          <div className="system-row">
            <span>API Status</span>
            <strong>{apiStatus}</strong>
          </div>

          <div className="system-row">
            <span>Last Checked</span>
            <strong>
              {health?.timestamp
                ? new Date(
                    health.timestamp
                  ).toLocaleString()
                : "—"}
            </strong>
          </div>
        </article>
      </section>

      <article className="panel resources-panel">
        <div className="panel-heading">
          <div>
            <h2>Scanned Azure Resources</h2>

            <p>
              Security posture of Azure resources supported
              by CloudGuard scanning rules.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <h3>Scanning resources...</h3>

            <p>
              CloudGuard is checking Azure resource
              configurations.
            </p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h3>Unable to load resources</h3>
            <p>{error}</p>
          </div>
        ) : scannedResources.length === 0 ? (
          <div className="empty-state">
            <h3>No scanned resources</h3>

            <p>
              CloudGuard has not evaluated any supported
              Azure resources yet.
            </p>
          </div>
        ) : (
          <ResourceTable
            resources={scannedResources}
            onSelectResource={setSelectedResource}
            selectedResourceId={selectedResource?.id}
          />
        )}
      </article>

      <FindingDetails resource={selectedResource} />

      <article className="panel alerts-panel">
        <div className="panel-heading">
          <div>
            <h2>Recent Security Alerts</h2>

            <p>
              Alerts generated from CloudGuard security
              findings.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <h3>Loading alerts...</h3>

            <p>
              CloudGuard is retrieving security alerts.
            </p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h3>Unable to load alerts</h3>
            <p>{error}</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="empty-state">
            <h3>No alerts available</h3>

            <p>
              No security alerts are currently recorded.
            </p>
          </div>
        ) : (
          <AlertsTable alerts={alerts} />
        )}
      </article>
    </main>
  );
}

export default Dashboard;