import { useEffect, useMemo, useState } from "react";
import CreateIncidentForm from "../components/CreateIncidentForm";
import IncidentCard from "../components/IncidentCard";
import IncidentDetails from "../components/IncidentDetails";
import {
  createIncident,
  getAlerts,
  getIncidents,
  updateIncidentStatus,
} from "../services/api";

function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [availableAlerts, setAvailableAlerts] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const refreshIncidents = async (selectedId = null) => {
    const data = await getIncidents();
    const receivedIncidents = Array.isArray(data?.incidents)
      ? data.incidents
      : [];

    setIncidents(receivedIncidents);
    setSummary(data?.summary || null);

    setSelectedIncident((current) => {
      const idToSelect = selectedId || current?.id;

      return (
        receivedIncidents.find(
          (incident) => incident.id === idToSelect
        ) ||
        receivedIncidents[0] ||
        null
      );
    });

    return receivedIncidents;
  };

  useEffect(() => {
    let cancelled = false;

    const loadPage = async () => {
      try {
        setLoading(true);

        const [incidentData, alertData] = await Promise.all([
          getIncidents(),
          getAlerts(),
        ]);

        if (cancelled) return;

        const receivedIncidents = Array.isArray(
          incidentData?.incidents
        )
          ? incidentData.incidents
          : [];

        const receivedAlerts = Array.isArray(alertData?.alerts)
          ? alertData.alerts
          : [];

        const incidentAlertIds = new Set(
          receivedIncidents.map((incident) => incident.alertId)
        );

        setIncidents(receivedIncidents);
        setSummary(incidentData?.summary || null);
        setSelectedIncident(receivedIncidents[0] || null);

        setAvailableAlerts(
          receivedAlerts.filter(
            (alert) => !incidentAlertIds.has(alert.id)
          )
        );
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.message || "Unable to load incidents."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPage();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredIncidents = useMemo(() => {
    const searchValue = searchTerm.toLowerCase().trim();

    return incidents.filter((incident) => {
      const matchesSearch =
        incident.title?.toLowerCase().includes(searchValue) ||
        incident.id?.toLowerCase().includes(searchValue) ||
        incident.resourceName
          ?.toLowerCase()
          .includes(searchValue) ||
        incident.assignedTo?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        incident.status === statusFilter;

      const matchesSeverity =
        severityFilter === "All" ||
        incident.severity === severityFilter;

      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [incidents, searchTerm, statusFilter, severityFilter]);

  const handleCreateIncident = async (incidentData) => {
    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      const data = await createIncident(incidentData);

      setMessage(data.message);
      await refreshIncidents(data.incident.id);

      setAvailableAlerts((current) =>
        current.filter(
          (alert) => alert.id !== incidentData.alertId
        )
      );

      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (
    incidentId,
    status,
    note
  ) => {
    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      const data = await updateIncidentStatus(
        incidentId,
        status,
        note
      );

      setMessage(data.message);
      await refreshIncidents(incidentId);

      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Incident Response</p>
          <h1>Incidents</h1>
          <span>
            Create, investigate, resolve and close security incidents.
          </span>
        </div>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <p className="stat-title">Total Incidents</p>
          <h3>{summary?.totalIncidents ?? 0}</h3>
          <span>All investigation cases</span>
        </article>

        <article className="stat-card">
          <p className="stat-title">Open</p>
          <h3>{summary?.openIncidents ?? 0}</h3>
          <span>Awaiting investigation</span>
        </article>

        <article className="stat-card">
          <p className="stat-title">In Progress</p>
          <h3>{summary?.inProgressIncidents ?? 0}</h3>
          <span>Currently investigated</span>
        </article>

        <article className="stat-card">
          <p className="stat-title">Resolved / Closed</p>
          <h3>
            {(summary?.resolvedIncidents ?? 0) +
              (summary?.closedIncidents ?? 0)}
          </h3>
          <span>Completed incidents</span>
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

      {availableAlerts.length > 0 && (
        <CreateIncidentForm
          alerts={availableAlerts}
          onCreate={handleCreateIncident}
          actionLoading={actionLoading}
        />
      )}

      <section className="panel incident-controls-panel">
        <div className="resource-controls">
          <input
            type="search"
            placeholder="Search incidents, analysts or resources"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="All">All statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

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
        </div>
      </section>

      {loading ? (
        <article className="panel resources-panel">
          <div className="empty-state">
            <h3>Loading incidents...</h3>
          </div>
        </article>
      ) : incidents.length === 0 ? (
        <article className="panel resources-panel">
          <div className="empty-state">
            <h3>No incidents created</h3>
            <p>
              Convert an available security alert into an incident.
            </p>
          </div>
        </article>
      ) : (
        <section className="incidents-page-layout">
          <div className="incidents-list">
            {filteredIncidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                isSelected={
                  selectedIncident?.id === incident.id
                }
                onSelect={setSelectedIncident}
              />
            ))}

            {filteredIncidents.length === 0 && (
              <article className="panel">
                <div className="empty-state small">
                  <h3>No matching incidents</h3>
                  <p>Change the filters and try again.</p>
                </div>
              </article>
            )}
          </div>

          <IncidentDetails
            key={selectedIncident?.id || "no-incident"}
            incident={selectedIncident}
            onStatusUpdate={handleStatusUpdate}
            actionLoading={actionLoading}
          />
        </section>
      )}
    </main>
  );
}

export default Incidents;