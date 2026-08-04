function ReportBar({ label, value, maximum, variant = "default" }) {
  const safeMaximum = maximum > 0 ? maximum : 1;

  const percentage = Math.min(
    100,
    Math.max(0, Math.round((value / safeMaximum) * 100))
  );

  return (
    <div className="report-bar-item">
      <div className="report-bar-header">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <div className="report-bar-track">
        <div
          className={`report-bar-fill ${variant}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

export default ReportBar;