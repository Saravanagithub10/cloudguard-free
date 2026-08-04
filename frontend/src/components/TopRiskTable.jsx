function TopRiskTable({ resources = [] }) {
  if (resources.length === 0) {
    return (
      <div className="empty-state small">
        <p>No risk data available.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="resource-table">
        <thead>
          <tr>
            <th>Resource</th>
            <th>Type</th>
            <th>Risk</th>
            <th>Risk Points</th>
            <th>Findings</th>
          </tr>
        </thead>

        <tbody>
          {resources.map((resource) => (
            <tr key={resource.id}>
              <td>
                <strong>{resource.name}</strong>
                <span>{resource.id}</span>
              </td>

              <td>{resource.type}</td>

              <td>
                <span
                  className={`severity-badge ${
                    resource.riskLevel?.toLowerCase() || "low"
                  }`}
                >
                  {resource.riskLevel}
                </span>
              </td>

              <td>{resource.riskPoints}</td>
              <td>{resource.findingsCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TopRiskTable;