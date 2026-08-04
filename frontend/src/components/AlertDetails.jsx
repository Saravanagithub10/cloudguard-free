import { useState } from "react";

function AlertDetails({
  alert,
  onAcknowledge,
  onResolve,
  actionLoading = false,
}) {
  const [resolutionNote, setResolutionNote] = useState("");

  if (!alert) {
    return (
      <article className="panel alert-details-panel">
        <div className="empty-state">
          <h3>Select an alert</h3>
          <p>Choose an alert to view incident-response details.</p>
        </div>
      </article>
    );
  }

  const canAcknowledge = alert.status === "Active";
  const canResolve = alert.status === "Acknowledged";
  const activity = Array.isArray(alert.activity) ? alert.activity : [];

  const handleAcknowledge = () => {
    if (typeof onAcknowledge === "function") {
      onAcknowledge(alert.id);
    }
  };

  const handleResolve = async (event) => {
    event.preventDefault();

    const cleanNote = resolutionNote.trim();

    if (!cleanNote || typeof onResolve !== "function") {
      return;
    }

    const success = await onResolve(alert.id, cleanNote);

    if (success) {
      setResolutionNote("");
    }
  };

  return (
    <article className="panel alert-details-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Incident Response</p>
          <h2>{alert.title || "Security Alert"}</h2>
          <p>{alert.id || "—"}</p>
        </div>

        <div className="alert-details-badges">
          <span
            className={`severity-badge ${
              alert.severity?.toLowerCase().replace(/\s+/g, "-") || "low"
            }`}
          >
            {alert.severity || "Unknown"}
          </span>

          <span
            className={`alert-status ${
              alert.status?.toLowerCase().replace(/\s+/g, "-") || "active"
            }`}
          >
            {alert.status || "Unknown"}
          </span>
        </div>
      </div>

      <div className="finding-summary">
        <div>
          <span>Resource</span>
          <strong>{alert.resourceName || "—"}</strong>
        </div>

        <div>
          <span>Resource Type</span>
          <strong>{alert.resourceType || "—"}</strong>
        </div>

        <div>
          <span>Resource Group</span>
          <strong>{alert.resourceGroup || "—"}</strong>
        </div>

        <div>
          <span>Risk Points</span>
          <strong>{alert.riskPoints ?? 0}</strong>
        </div>
      </div>

      <section className="alert-recommendation">
        <h3>Recommendation</h3>
        <p>{alert.recommendation || "No recommendation available."}</p>
      </section>

      <div className="alert-actions">
        <button
          type="button"
          className="primary-button"
          disabled={!canAcknowledge || actionLoading}
          onClick={handleAcknowledge}
        >
          {actionLoading && canAcknowledge
            ? "Processing..."
            : "Acknowledge Alert"}
        </button>
      </div>

      <form className="resolve-form" onSubmit={handleResolve}>
        <label htmlFor="resolution-note">Resolution note</label>

        <textarea
          id="resolution-note"
          rows={4}
          placeholder={
            canResolve
              ? "Explain the remediation action completed..."
              : "Acknowledge the alert before resolving it."
          }
          value={resolutionNote}
          disabled={!canResolve || actionLoading}
          onChange={(event) => setResolutionNote(event.target.value)}
        />

        <button
          type="submit"
          className="resolve-button"
          disabled={
            !canResolve ||
            resolutionNote.trim().length === 0 ||
            actionLoading
          }
        >
          {actionLoading && canResolve
            ? "Resolving..."
            : "Resolve Alert"}
        </button>
      </form>

      {alert.status === "Resolved" && (
        <section className="resolution-summary">
          <h3>Resolution</h3>

          <p>{alert.resolutionNote || "No resolution note available."}</p>

          <span>
            Resolved at:{" "}
            {alert.resolvedAt
              ? new Date(alert.resolvedAt).toLocaleString()
              : "—"}
          </span>
        </section>
      )}

      <section className="activity-section">
        <h3>Activity Timeline</h3>

        {activity.length === 0 ? (
          <div className="empty-state small">
            <p>No activity history available.</p>
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
                  <strong>{item.action || "Activity"}</strong>

                  <p>{item.message || "No activity description."}</p>

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

export default AlertDetails;