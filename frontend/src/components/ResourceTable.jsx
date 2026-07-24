function ResourceTable({ resources, onSelectResource, selectedResourceId }) {
  return (
    <div className="table-wrapper">
      <table className="resource-table">
        <thead>
          <tr>
            <th>Resource</th>
            <th>Type</th>
            <th>Region</th>
            <th>Risk</th>
            <th>Findings</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {resources.map((resource) => (
            <tr
              key={resource.id}
              className={
                selectedResourceId === resource.id ? "selected-row" : ""
              }
onClick={() => onSelectResource?.(resource)}            >
              <td>
                <strong>{resource.name}</strong>
                <span>{resource.resourceGroup}</span>
              </td>

              <td>{resource.type}</td>
              <td>{resource.region}</td>

              <td>
                <span
                  className={`severity-badge ${resource.riskLevel.toLowerCase()}`}
                >
                  {resource.riskLevel}
                </span>
              </td>

              <td>{resource.findings.length}</td>

              <td>
                <span
                  className={`resource-status ${
                    resource.securityStatus === "Healthy"
                      ? "healthy"
                      : "at-risk"
                  }`}
                >
                  {resource.securityStatus}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ResourceTable;