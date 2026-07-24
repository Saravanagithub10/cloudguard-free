function StatCard({ title, value, description }) {
  return (
    <article className="stat-card">
      <p className="stat-title">{title}</p>
      <h3>{value}</h3>
      <span>{description}</span>
    </article>
  );
}

export default StatCard;