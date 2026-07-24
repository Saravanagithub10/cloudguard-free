function FindingDetails({ resource }) {
  if (!resource) {
    return (
      <article className="panel findings-panel">
        <div className="empty-state">
          <h3>Select a resource</h3>
          <p>Choose a resource to view security findings.</p>
        </div>
      </article>
    );
  }

  return (
    <article className="panel findings-panel">
      <div className="panel-heading">
        <div>
          <h2>Finding Details</h2>
          <p>
            Security findings detected for{" "}
            <strong>{resource.name}</strong>.
          </p>
        </div>

        <span
          className={`severity-badge ${resource.riskLevel.toLowerCase()}`}
        >
          {resource.riskLevel}
        </span>
      </div>

      <div className="finding-summary">
        <div>
          <span>Resource Type</span>
          <strong>{resource.type}</strong>
        </div>

        <div>
          <span>Region</span>
          <strong>{resource.region}</strong>
        </div>

        <div>
          <span>Risk Points</span>
          <strong>{resource.riskPoints}</strong>
        </div>

        <div>
          <span>Total Findings</span>
          <strong>{resource.findings.length}</strong>
        </div>
      </div>

      <div className="findings-list">
        {resource.findings.map((finding) => (
          <div className="finding-card" key={finding.ruleId}>
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
              <strong>Recommendation:</strong>{" "}
              {finding.recommendation}
            </p>

            <span className="risk-points">
              Risk points: {finding.points}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

export default FindingDetails;