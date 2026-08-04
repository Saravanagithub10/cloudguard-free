function IncidentCard({ incident, isSelected, onSelect }) {
  const statusClass =
    incident.status?.toLowerCase().replace(/\s+/g, "-") || "open";

  return (
    <article
      className={`incident-card ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect?.(incident)}
    >
      <div className="incident-card-header">
        <div>
          <span className="rule-id">{incident.id}</span>
          <h3>{incident.title}</h3>
        </div>

        <span
          className={`severity-badge ${
            incident.severity?.toLowerCase() || "low"
          }`}
        >
          {incident.severity}
        </span>
      </div>

      <div className="incident-card-meta">
        <span>{incident.resourceName}</span>
        <span>Assigned to: {incident.assignedTo}</span>
      </div>

      <div className="incident-card-footer">
        <span className={`incident-status ${statusClass}`}>
          {incident.status}
        </span>

        <span>{incident.priority} priority</span>
      </div>
    </article>
  );
}

export default IncidentCard;