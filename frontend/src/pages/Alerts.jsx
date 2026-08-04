import { useEffect, useMemo, useState } from "react";
import AlertCard from "../components/AlertCard";
import AlertDetails from "../components/AlertDetails";
import {
  acknowledgeAlert,
  getAlerts,
  resolveAlert,
} from "../services/api";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const fetchInitialAlerts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAlerts();

        if (isCancelled) {
          return;
        }

        const receivedAlerts = Array.isArray(data?.alerts)
          ? data.alerts
          : [];

        setAlerts(receivedAlerts);
        setSummary(data?.summary || null);
        setSelectedAlert(receivedAlerts[0] || null);
      } catch (requestError) {
        if (!isCancelled) {
          setError(
            requestError.message || "Unable to load security alerts."
          );
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchInitialAlerts();

    return () => {
      isCancelled = true;
    };
  }, []);

  const refreshAlerts = async (selectedId = null) => {
    const data = await getAlerts();

    const receivedAlerts = Array.isArray(data?.alerts)
      ? data.alerts
      : [];

    setAlerts(receivedAlerts);
    setSummary(data?.summary || null);

    setSelectedAlert((currentSelectedAlert) => {
      const idToSelect = selectedId || currentSelectedAlert?.id;

      return (
        receivedAlerts.find((alert) => alert.id === idToSelect) ||
        receivedAlerts[0] ||
        null
      );
    });
  };

  const filteredAlerts = useMemo(() => {
    const searchValue = searchTerm.toLowerCase().trim();

    return alerts.filter((alert) => {
      const title = alert.title?.toLowerCase() || "";
      const resourceName = alert.resourceName?.toLowerCase() || "";
      const alertId = alert.id?.toLowerCase() || "";

      const matchesSearch =
        title.includes(searchValue) ||
        resourceName.includes(searchValue) ||
        alertId.includes(searchValue);

      const matchesSeverity =
        severityFilter === "All" || alert.severity === severityFilter;

      const matchesStatus =
        statusFilter === "All" || alert.status === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [alerts, searchTerm, severityFilter, statusFilter]);

  const handleAcknowledge = async (alertId) => {
    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      const data = await acknowledgeAlert(alertId);

      setMessage(data.message || "Alert acknowledged successfully.");

      await refreshAlerts(alertId);
    } catch (requestError) {
      setError(
        requestError.message || "Unable to acknowledge the alert."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (alertId, resolutionNote) => {
    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      const data = await resolveAlert(alertId, resolutionNote);

      setMessage(data.message || "Alert resolved successfully.");

      await refreshAlerts(alertId);

      return true;
    } catch (requestError) {
      setError(requestError.message || "Unable to resolve the alert.");

      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Security Operations</p>
          <h1>Alerts</h1>

          <span>
            Investigate, acknowledge and resolve security alerts.
          </span>
        </div>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <p className="stat-title">Total Alerts</p>
          <h3>{summary?.totalAlerts ?? 0}</h3>
          <span>All generated alerts</span>
        </article>

        <article className="stat-card">
          <p className="stat-title">Active</p>
          <h3>{summary?.activeAlerts ?? 0}</h3>
          <span>Awaiting investigation</span>
        </article>

        <article className="stat-card">
          <p className="stat-title">Acknowledged</p>
          <h3>{summary?.acknowledgedAlerts ?? 0}</h3>
          <span>Currently under investigation</span>
        </article>

        <article className="stat-card">
          <p className="stat-title">Resolved</p>
          <h3>{summary?.resolvedAlerts ?? 0}</h3>
          <span>Completed remediation</span>
        </article>
      </section>

      {(message || error) && (
        <div
          className={`feedback-banner ${
            error ? "error" : "success"
          }`}
        >
          {error || message}
        </div>
      )}

      <section className="panel alert-controls-panel">
        <div className="resource-controls">
          <input
            type="search"
            placeholder="Search alerts, resources or alert IDs"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <select
            value={severityFilter}
            onChange={(event) =>
              setSeverityFilter(event.target.value)
            }
          >
            <option value="All">All severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </section>

      {loading ? (
        <article className="panel resources-panel">
          <div className="empty-state">
            <h3>Loading alerts...</h3>
            <p>CloudGuard is retrieving security alerts.</p>
          </div>
        </article>
      ) : error && alerts.length === 0 ? (
        <article className="panel resources-panel">
          <div className="empty-state">
            <h3>Unable to load alerts</h3>
            <p>{error}</p>
          </div>
        </article>
      ) : (
        <section className="alerts-page-layout">
          <div className="alerts-list">
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                isSelected={selectedAlert?.id === alert.id}
                onSelect={setSelectedAlert}
              />
            ))}

            {filteredAlerts.length === 0 && (
              <article className="panel">
                <div className="empty-state small">
                  <h3>No matching alerts</h3>
                  <p>Change your search text or filters.</p>
                </div>
              </article>
            )}
          </div>

          <AlertDetails
            key={selectedAlert?.id || "no-alert"}
            alert={selectedAlert}
            onAcknowledge={handleAcknowledge}
            onResolve={handleResolve}
            actionLoading={actionLoading}
          />
        </section>
      )}
    </main>
  );
}

export default Alerts;