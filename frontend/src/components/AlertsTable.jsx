function AlertsTable({ alerts = [] }) {
  if (!alerts.length) {
    return (
      <div className="empty-state">
        <h3>No active alerts</h3>
        <p>CloudGuard has not detected any security alerts.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="resource-table">
        <thead>
          <tr>
            <th>Alert</th>
            <th>Resource</th>
            <th>Severity</th>
            <th>Risk Points</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {alerts.map((alert) => (
            <tr key={alert.id}>
              <td>
                <strong>{alert.title}</strong>
                <span>{alert.id}</span>
              </td>

              <td>
                <strong>{alert.resourceName}</strong>
                <span>{alert.resourceType}</span>
              </td>

              <td>
                <span
                  className={`severity-badge ${alert.severity.toLowerCase()}`}
                >
                  {alert.severity}
                </span>
              </td>

              <td>{alert.riskPoints}</td>

              <td>
                <span className="resource-status at-risk">
                  {alert.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AlertsTable;