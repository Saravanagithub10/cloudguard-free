function AlertCard({ alert, isSelected, onSelect }) {
  return (
    <article
      className={`alert-card ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(alert)}
    >
      <div className="alert-card-header">
        <div>
          <span className="rule-id">{alert.id}</span>
          <h3>{alert.title}</h3>
        </div>

        <span
          className={`severity-badge ${alert.severity.toLowerCase()}`}
        >
          {alert.severity}
        </span>
      </div>

      <div className="alert-card-meta">
        <span>{alert.resourceName}</span>
        <span>{alert.resourceType}</span>
      </div>

      <div className="alert-card-footer">
        <span className={`alert-status ${alert.status.toLowerCase()}`}>
          {alert.status}
        </span>

        <span>{alert.riskPoints} risk points</span>
      </div>
    </article>
  );
}

export default AlertCard;