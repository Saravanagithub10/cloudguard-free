function MetricTrendChart({
  data = [],
}) {
  if (!data.length) {
    return (
      <div className="empty-state small">
        <h3>No metric history</h3>
        <p>
          Azure Monitor has not returned
          historical request data yet.
        </p>
      </div>
    );
  }

  const values = data.map(
    (item) => item.requests || 0
  );

  const maxValue = Math.max(
    1,
    ...values
  );

  return (
    <div className="metric-chart">
      <div className="metric-bars">
        {data.map(
          (item, index) => {
            const value =
              item.requests || 0;

            const height =
              Math.max(
                4,
                (value / maxValue) *
                  100
              );

            const label =
              item.timestamp
                ? new Date(
                    item.timestamp
                  ).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )
                : "—";

            return (
              <div
                className="metric-bar-column"
                key={`${item.timestamp}-${index}`}
              >
                <div
                  className="metric-bar"
                  style={{
                    height: `${height}%`,
                  }}
                  title={`${label}: ${value} requests`}
                ></div>

                <span>
                  {label}
                </span>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

export default MetricTrendChart;