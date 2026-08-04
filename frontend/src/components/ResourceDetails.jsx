function ResourceDetails({ resource }) {
  if (!resource) {
    return (
      <article className="panel resource-details-panel">
        <div className="empty-state">
          <h3>Select a resource</h3>
          <p>Choose a resource card to view complete security details.</p>
        </div>
      </article>
    );
  }

  return (
    <article className="panel resource-details-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Selected Resource</p>
          <h2>{resource.name}</h2>
          <p>{resource.type}</p>
        </div>

        <span
          className={`severity-badge ${resource.riskLevel.toLowerCase()}`}
        >
          {resource.riskLevel}
        </span>
      </div>

      <div className="finding-summary">
        <div>
          <span>Resource Group</span>
          <strong>{resource.resourceGroup}</strong>
        </div>

        <div>
          <span>Region</span>
          <strong>{resource.region}</strong>
        </div>

        <div>
          <span>Runtime Status</span>
          <strong>{resource.status}</strong>
        </div>

        <div>
          <span>Risk Points</span>
          <strong>{resource.riskPoints}</strong>
        </div>
      </div>

      <div className="findings-list">
        {resource.findings.map((finding) => (
          <section className="finding-card" key={finding.ruleId}>
            <div className="finding-card-header">
              <div>
                <span className="rule-id">{finding.ruleId}</span>
                <h3>{finding.title}</h3>
              </div>

              <span
                className={`severity-badge ${finding.severity.toLowerCase()}`}
              >
                {finding.severity}
              </span>
            </div>

            <p>
              <strong>Recommendation:</strong> {finding.recommendation}
            </p>

            <span className="risk-points">
              Risk contribution: {finding.points} points
            </span>
          </section>
        ))}
      </div>
    </article>
  );
}

export default ResourceDetails;