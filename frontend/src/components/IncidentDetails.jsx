import { useState } from "react";

function IncidentDetails({
  incident,
  onStatusUpdate,
  actionLoading = false,
}) {
  const [statusNote, setStatusNote] = useState("");

  if (!incident) {
    return (
      <article className="panel incident-details-panel">
        <div className="empty-state">
          <h3>Select an incident</h3>
          <p>Choose an incident to view investigation details.</p>
        </div>
      </article>
    );
  }

  const activity = Array.isArray(incident.activity)
    ? incident.activity
    : [];

  const nextStatus =
    incident.status === "Open"
      ? "In Progress"
      : incident.status === "In Progress"
        ? "Resolved"
        : incident.status === "Resolved"
          ? "Closed"
          : null;

  const requiresNote =
    nextStatus === "Resolved" || nextStatus === "Closed";

  const handleStatusUpdate = async () => {
    if (!nextStatus || typeof onStatusUpdate !== "function") {
      return;
    }

    const cleanNote = statusNote.trim();

    if (requiresNote && !cleanNote) {
      return;
    }

    const success = await onStatusUpdate(
      incident.id,
      nextStatus,
      cleanNote ||
        `Incident moved from ${incident.status} to ${nextStatus}.`
    );

    if (success) {
      setStatusNote("");
    }
  };

  return (
    <article className="panel incident-details-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Incident Investigation</p>
          <h2>{incident.title}</h2>
          <p>{incident.id}</p>
        </div>

        <div className="alert-details-badges">
          <span
            className={`severity-badge ${
              incident.severity?.toLowerCase() || "low"
            }`}
          >
            {incident.severity}
          </span>

          <span
            className={`incident-status ${
              incident.status?.toLowerCase().replace(/\s+/g, "-") ||
              "open"
            }`}
          >
            {incident.status}
          </span>
        </div>
      </div>

      <div className="finding-summary">
        <div>
          <span>Assigned Analyst</span>
          <strong>{incident.assignedTo}</strong>
        </div>

        <div>
          <span>Priority</span>
          <strong>{incident.priority}</strong>
        </div>

        <div>
          <span>Resource</span>
          <strong>{incident.resourceName}</strong>
        </div>

        <div>
          <span>Related Alert</span>
          <strong>{incident.alertId}</strong>
        </div>
      </div>

      <section className="incident-information">
        <h3>Description</h3>
        <p>{incident.description}</p>
      </section>

      <section className="incident-information">
        <h3>Security Recommendation</h3>
        <p>{incident.recommendation}</p>
      </section>

      {nextStatus && (
        <section className="incident-action-section">
          <h3>Update Incident</h3>

          <p>
            Next workflow status: <strong>{nextStatus}</strong>
          </p>

          <textarea
            rows={4}
            value={statusNote}
            placeholder={
              requiresNote
                ? `Enter a note before marking the incident as ${nextStatus}...`
                : "Optional investigation note..."
            }
            disabled={actionLoading}
            onChange={(event) => setStatusNote(event.target.value)}
          />

          <button
            type="button"
            className={
              nextStatus === "Closed"
                ? "resolve-button"
                : "primary-button"
            }
            disabled={
              actionLoading ||
              (requiresNote && statusNote.trim().length === 0)
            }
            onClick={handleStatusUpdate}
          >
            {actionLoading
              ? "Updating..."
              : `Move to ${nextStatus}`}
          </button>
        </section>
      )}

      {incident.status === "Closed" && (
        <section className="resolution-summary">
          <h3>Incident Closed</h3>
          <p>
            {incident.resolutionNote ||
              "Incident remediation completed and verified."}
          </p>

          <span>
            Closed at:{" "}
            {incident.closedAt
              ? new Date(incident.closedAt).toLocaleString()
              : "—"}
          </span>
        </section>
      )}

      <section className="activity-section">
        <h3>Incident Activity</h3>

        {activity.length === 0 ? (
          <div className="empty-state small">
            <p>No incident activity available.</p>
          </div>
        ) : (
          <div className="activity-timeline">
            {activity.map((item, index) => (
              <article
                className="activity-item"
                key={`${item.action}-${item.timestamp}-${index}`}
              >
                <span className="activity-dot"></span>

                <div>
                  <strong>{item.action}</strong>
                  <p>{item.message}</p>

                  <time>
                    {item.timestamp
                      ? new Date(item.timestamp).toLocaleString()
                      : "—"}
                  </time>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </article>
  );
}

export default IncidentDetails;