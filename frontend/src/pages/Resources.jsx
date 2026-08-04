import { useEffect, useMemo, useState } from "react";
import ResourceCard from "../components/ResourceCard";
import ResourceDetails from "../components/ResourceDetails";
import { getResources } from "../services/api";

function Resources() {
  const [resources, setResources] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getResources();

        setResources(data.resources);
        setSummary(data.summary);
        setSelectedResource(data.resources[0] || null);
      } catch (requestError) {
        setError(requestError.message || "Unable to load resources.");
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, []);

  const resourceTypes = useMemo(
    () => ["All", ...new Set(resources.map((resource) => resource.type))],
    [resources]
  );

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.resourceGroup
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesRisk =
        riskFilter === "All" || resource.riskLevel === riskFilter;

      const matchesType =
        typeFilter === "All" || resource.type === typeFilter;

      return matchesSearch && matchesRisk && matchesType;
    });
  }, [resources, searchTerm, riskFilter, typeFilter]);

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Cloud Resource Inventory</p>
          <h1>Resources</h1>
          <span>
            Search, filter and inspect monitored Azure resources.
          </span>
        </div>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <p className="stat-title">Total Resources</p>
          <h3>{summary?.totalResources ?? 0}</h3>
          <span>Resources scanned</span>
        </article>

        <article className="stat-card">
          <p className="stat-title">Healthy</p>
          <h3>{summary?.healthyResources ?? 0}</h3>
          <span>No security findings</span>
        </article>

        <article className="stat-card">
          <p className="stat-title">At Risk</p>
          <h3>{summary?.atRiskResources ?? 0}</h3>
          <span>Resources requiring attention</span>
        </article>

        <article className="stat-card">
          <p className="stat-title">Critical</p>
          <h3>{summary?.criticalResources ?? 0}</h3>
          <span>Immediate action required</span>
        </article>
      </section>

      <section className="panel resource-controls-panel">
        <div className="resource-controls">
          <input
            type="search"
            placeholder="Search resource name or resource group"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            {resourceTypes.map((type) => (
              <option value={type} key={type}>
                {type === "All" ? "All resource types" : type}
              </option>
            ))}
          </select>

          <select
            value={riskFilter}
            onChange={(event) => setRiskFilter(event.target.value)}
          >
            <option value="All">All risk levels</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </section>

      {loading ? (
        <article className="panel resources-panel">
          <div className="empty-state">
            <h3>Loading resources...</h3>
            <p>CloudGuard is fetching the resource inventory.</p>
          </div>
        </article>
      ) : error ? (
        <article className="panel resources-panel">
          <div className="empty-state">
            <h3>Unable to load resources</h3>
            <p>{error}</p>
          </div>
        </article>
      ) : (
        <>
          <section className="resource-page-grid">
            <div className="resource-cards-grid">
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  isSelected={selectedResource?.id === resource.id}
                  onSelect={setSelectedResource}
                />
              ))}
            </div>

            {filteredResources.length === 0 && (
              <article className="panel">
                <div className="empty-state small">
                  <h3>No matching resources</h3>
                  <p>Change the search text or filters and try again.</p>
                </div>
              </article>
            )}
          </section>

          <ResourceDetails resource={selectedResource} />
        </>
      )}
    </main>
  );
}

export default Resources;