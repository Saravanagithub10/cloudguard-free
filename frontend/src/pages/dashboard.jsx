import { useEffect, useState } from "react";
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
  const [resourceSummary, setResourceSummary] = useState(null);
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [alertSummary, setAlertSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [healthData, resourceData, alertData] = await Promise.all([
          getHealthStatus(),
          getResources(),
          getAlerts(),
        ]);

        setHealth(healthData);

        setResourceSummary(resourceData.summary);
        setResources(resourceData.resources);
        setSelectedResource(resourceData.resources[0] || null);

        setAlerts(alertData.alerts);
        setAlertSummary(alertData.summary);
      } catch (requestError) {
        setError(
          requestError.message || "Unable to load CloudGuard dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const apiStatus = loading
    ? "Checking..."
    : error
      ? "Offline"
      : health?.status || "Unknown";

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Security Operations Dashboard</p>
          <h1>CloudGuard Overview</h1>
          <span>
            Monitor security findings, alerts and simulated Azure resources.
          </span>
        </div>

        <div className={`api-badge ${error ? "offline" : ""}`}>
          <span className="status-dot"></span>
          API: {apiStatus}
        </div>
      </header>

      <section className="stats-grid">
        <StatCard
          title="Security Score"
          value={`${resourceSummary?.securityScore ?? 0}%`}
          description="Calculated from security findings"
        />

        <StatCard
          title="Total Resources"
          value={resourceSummary?.totalResources ?? 0}
          description="Resources scanned by CloudGuard"
        />

        <StatCard
          title="At-Risk Resources"
          value={resourceSummary?.atRiskResources ?? 0}
          description="Resources with security findings"
        />

        <StatCard
          title="Active Alerts"
          value={alertSummary?.activeAlerts ?? 0}
          description={`${alertSummary?.criticalAlerts ?? 0} critical alerts`}
        />
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>Security Scan Summary</h2>
              <p>CloudGuard analysis of simulated Azure resources.</p>
            </div>
          </div>

          <div className="empty-state">
            {loading ? (
              <>
                <h3>Scanning resources...</h3>
                <p>Please wait while CloudGuard checks configurations.</p>
              </>
            ) : error ? (
              <>
                <h3>Scan unavailable</h3>
                <p>{error}</p>
              </>
            ) : (
              <>
                <h3>
                  {resourceSummary?.atRiskResources ?? 0} resources need
                  attention
                </h3>

                <p>
                  Security score: {resourceSummary?.securityScore ?? 0}%
                </p>

                <p>
                  Critical alerts: {alertSummary?.criticalAlerts ?? 0}
                </p>
              </>
            )}
          </div>
        </article>

        <article className="panel system-panel">
          <div className="panel-heading">
            <div>
              <h2>System Information</h2>
              <p>Current CloudGuard service status.</p>
            </div>
          </div>

          <div className="system-row">
            <span>Project</span>
            <strong>{health?.project || "CloudGuard Free"}</strong>
          </div>

          <div className="system-row">
            <span>Version</span>
            <strong>{health?.version || "—"}</strong>
          </div>

          <div className="system-row">
            <span>Environment</span>
            <strong>{health?.environment || "—"}</strong>
          </div>

          <div className="system-row">
            <span>API Status</span>
            <strong>{apiStatus}</strong>
          </div>

          <div className="system-row">
            <span>Last Checked</span>
            <strong>
              {health?.timestamp
                ? new Date(health.timestamp).toLocaleString()
                : "—"}
            </strong>
          </div>
        </article>
      </section>

      <article className="panel resources-panel">
        <div className="panel-heading">
          <div>
            <h2>Monitored Resources</h2>
            <p>Security posture of simulated Azure resources.</p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <h3>Scanning resources...</h3>
            <p>CloudGuard is checking resource configurations.</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h3>Unable to load resources</h3>
            <p>{error}</p>
          </div>
        ) : (
          <ResourceTable
            resources={resources}
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
              Alerts generated from detected security misconfigurations.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <h3>Loading alerts...</h3>
            <p>CloudGuard is generating security alerts.</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h3>Unable to load alerts</h3>
            <p>{error}</p>
          </div>
        ) : (
          <AlertsTable alerts={alerts} />
        )}
      </article>
    </main>
  );
}

export default Dashboard;