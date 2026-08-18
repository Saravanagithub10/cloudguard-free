import { useEffect, useState } from "react";

function AlertDetails({
  alert,
  onAcknowledge,
  onResolve,
  actionLoading,
}) {
  const [resolutionNote, setResolutionNote] = useState("");

  useEffect(() => {
    setResolutionNote("");
  }, [alert?.id]);

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

  const handleResolve = async (event) => {
    event.preventDefault();

    const cleanNote = resolutionNote.trim();

    if (!cleanNote) {
      return;
    }

    const success = await onResolve(alert.id, cleanNote);

    if (success) {
      setResolutionNote("");
    }
  };

  const emailStatus = alert.emailNotificationSent
    ? "Sent"
    : "Not Sent";

  return (
    <article className="panel alert-details-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Incident Response</p>

          <h2>{alert.title}</h2>

          <p>{alert.id}</p>
        </div>

        <div className="alert-details-badges">
          <span
            className={`severity-badge ${alert.severity.toLowerCase()}`}
          >
            {alert.severity}
          </span>

          <span
            className={`alert-status ${alert.status
              .toLowerCase()
              .replaceAll(" ", "-")}`}
          >
            {alert.status}
          </span>
        </div>
      </div>

      <div className="finding-summary">
        <div>
          <span>Resource</span>
          <strong>{alert.resourceName}</strong>
        </div>

        <div>
          <span>Resource Type</span>
          <strong>{alert.resourceType}</strong>
        </div>

        <div>
          <span>Resource Group</span>
          <strong>{alert.resourceGroup}</strong>
        </div>

        <div>
          <span>Region</span>
          <strong>{alert.region || "—"}</strong>
        </div>

        <div>
          <span>Rule ID</span>
          <strong>{alert.ruleId || "—"}</strong>
        </div>

        <div>
          <span>Risk Points</span>
          <strong>{alert.riskPoints}</strong>
        </div>
      </div>

      <section className="alert-recommendation">
        <h3>Recommendation</h3>
        <p>{alert.recommendation}</p>
      </section>

      <section className="alert-recommendation">
        <h3>Email Notification</h3>

        <div className="system-row">
          <span>Status</span>
          <strong>{emailStatus}</strong>
        </div>

        <div className="system-row">
          <span>Notified At</span>

          <strong>
            {alert.emailNotifiedAt
              ? new Date(alert.emailNotifiedAt).toLocaleString()
              : "—"}
          </strong>
        </div>

        {alert.notificationError && (
          <div className="system-row">
            <span>Error</span>
            <strong>{alert.notificationError}</strong>
          </div>
        )}
      </section>

      <div className="alert-actions">
        <button
          type="button"
          className="primary-button"
          disabled={!canAcknowledge || actionLoading}
          onClick={() => onAcknowledge(alert.id)}
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
          rows="4"
          placeholder={
            canResolve
              ? "Explain the remediation action completed..."
              : "Acknowledge the alert before resolving it."
          }
          value={resolutionNote}
          disabled={!canResolve || actionLoading}
          onChange={(event) =>
            setResolutionNote(event.target.value)
          }
        />

        <button
          type="submit"
          className="resolve-button"
          disabled={
            !canResolve ||
            !resolutionNote.trim() ||
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

          <p>{alert.resolutionNote}</p>

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

        <div className="activity-timeline">
          {(Array.isArray(alert.activity)
            ? alert.activity
            : []
          ).map((item, index) => (
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
      </section>
    </article>
  );
}

export default AlertDetails;