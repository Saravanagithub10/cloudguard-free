function ResourceCard({ resource, isSelected, onSelect }) {
  return (
    <article
      className={`resource-card ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(resource)}
    >
      <div className="resource-card-header">
        <div>
          <p className="resource-type">{resource.type}</p>
          <h3>{resource.name}</h3>
        </div>

        <span
          className={`severity-badge ${resource.riskLevel.toLowerCase()}`}
        >
          {resource.riskLevel}
        </span>
      </div>

      <div className="resource-card-meta">
        <span>{resource.region}</span>
        <span>{resource.resourceGroup}</span>
      </div>

      <div className="resource-card-footer">
        <span
          className={`resource-status ${
            resource.securityStatus === "Healthy" ? "healthy" : "at-risk"
          }`}
        >
          {resource.securityStatus}
        </span>

        <span>{resource.findings.length} findings</span>
      </div>
    </article>
  );
}

export default ResourceCard;