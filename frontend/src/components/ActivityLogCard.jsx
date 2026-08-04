function ActivityLogCard({ activity }) {
  const entityClass =
    activity.entityType?.toLowerCase() || "activity";

  const actionClass =
    activity.action?.toLowerCase().replace(/\s+/g, "-") ||
    "created";

  return (
    <article className="activity-log-card">
      <div className="activity-log-marker">
        <span
          className={`activity-log-dot ${entityClass}`}
        ></span>
      </div>

      <div className="activity-log-content">
        <div className="activity-log-header">
          <div>
            <span className="rule-id">
              {activity.entityId}
            </span>

            <h3>{activity.action}</h3>
          </div>

          <div className="activity-log-badges">
            <span className={`entity-badge ${entityClass}`}>
              {activity.entityType}
            </span>

            <span className={`action-badge ${actionClass}`}>
              {activity.action}
            </span>
          </div>
        </div>

        <p>{activity.message}</p>

        <div className="activity-log-meta">
          <span>{activity.resourceName || "—"}</span>
          <span>{activity.resourceType || "—"}</span>
          <span>
            {activity.timestamp
              ? new Date(activity.timestamp).toLocaleString()
              : "—"}
          </span>
        </div>
      </div>
    </article>
  );
}

export default ActivityLogCard;