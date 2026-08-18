import { useEffect, useMemo, useState } from "react";
import ResourceCard from "../components/ResourceCard";
import ResourceDetails from "../components/ResourceDetails";
import { getResources } from "../services/api";

function Resources() {
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadResources = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getResources();

        if (cancelled) {
          return;
        }

        const receivedResources = Array.isArray(data?.resources)
          ? data.resources
          : [];

        setResources(receivedResources);
        setSelectedResource(receivedResources[0] || null);
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.message || "Unable to load Azure resources."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadResources();

    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const totalResources = resources.length;

    const scannedResources = resources.filter(
      (resource) => resource.securityStatus !== "Not Scanned"
    ).length;

    const healthyResources = resources.filter(
      (resource) => resource.securityStatus === "Healthy"
    ).length;

    const atRiskResources = resources.filter(
      (resource) => resource.securityStatus === "At Risk"
    ).length;

    const notScannedResources = resources.filter(
      (resource) => resource.securityStatus === "Not Scanned"
    ).length;

    const criticalResources = resources.filter(
      (resource) => resource.riskLevel === "Critical"
    ).length;

    const highRiskResources = resources.filter(
      (resource) => resource.riskLevel === "High"
    ).length;

    const totalFindings = resources.reduce(
      (total, resource) =>
        total +
        (Array.isArray(resource.findings)
          ? resource.findings.length
          : 0),
      0
    );

    return {
      totalResources,
      scannedResources,
      healthyResources,
      atRiskResources,
      notScannedResources,
      criticalResources,
      highRiskResources,
      totalFindings,
    };
  }, [resources]);

  const resourceTypes = useMemo(() => {
    const types = resources
      .map((resource) => resource.type)
      .filter(Boolean);

    return ["All", ...new Set(types)];
  }, [resources]);

  const filteredResources = useMemo(() => {
    const searchValue = searchTerm.toLowerCase().trim();

    return resources.filter((resource) => {
      const resourceName =
        resource.name?.toLowerCase() || "";

      const resourceGroup =
        resource.resourceGroup?.toLowerCase() || "";

      const resourceType =
        resource.type?.toLowerCase() || "";

      const region =
        resource.region?.toLowerCase() || "";

      const matchesSearch =
        resourceName.includes(searchValue) ||
        resourceGroup.includes(searchValue) ||
        resourceType.includes(searchValue) ||
        region.includes(searchValue);

      const matchesRisk =
        riskFilter === "All" ||
        resource.riskLevel === riskFilter;

      const matchesType =
        typeFilter === "All" ||
        resource.type === typeFilter;

      const matchesStatus =
        statusFilter === "All" ||
        resource.securityStatus === statusFilter;

      return (
        matchesSearch &&
        matchesRisk &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    resources,
    searchTerm,
    riskFilter,
    typeFilter,
    statusFilter,
  ]);

  const handleSelectResource = (resource) => {
    setSelectedResource(resource);
  };

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">
            Azure Cloud Resource Inventory
          </p>

          <h1>Resources</h1>

          <span>
            Inspect real Azure resources and CloudGuard security findings.
          </span>
        </div>

        <div className="api-badge">
          <span className="status-dot"></span>
          Live Azure
        </div>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <p className="stat-title">Azure Resources</p>

          <h3>{summary.totalResources}</h3>

          <span>Resources discovered from Azure</span>
        </article>

        <article className="stat-card">
          <p className="stat-title">Scanned</p>

          <h3>{summary.scannedResources}</h3>

          <span>
            Resources supported by CloudGuard rules
          </span>
        </article>

        <article className="stat-card">
          <p className="stat-title">At Risk</p>

          <h3>{summary.atRiskResources}</h3>

          <span>
            Resources with security findings
          </span>
        </article>

        <article className="stat-card">
          <p className="stat-title">Security Findings</p>

          <h3>{summary.totalFindings}</h3>

          <span>
            Findings detected from Azure configuration
          </span>
        </article>
      </section>

      <section className="panel resource-controls-panel">
        <div className="resource-controls">
          <input
            type="search"
            placeholder="Search name, type, group or region"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value)
            }
          >
            {resourceTypes.map((type) => (
              <option value={type} key={type}>
                {type === "All"
                  ? "All resource types"
                  : type}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="All">
              All scan statuses
            </option>

            <option value="At Risk">
              At Risk
            </option>

            <option value="Healthy">
              Healthy
            </option>

            <option value="Not Scanned">
              Not Scanned
            </option>
          </select>

          <select
            value={riskFilter}
            onChange={(event) =>
              setRiskFilter(event.target.value)
            }
          >
            <option value="All">
              All risk levels
            </option>

            <option value="Critical">
              Critical
            </option>

            <option value="High">
              High
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="Low">
              Low
            </option>

            <option value="Unknown">
              Unknown
            </option>
          </select>
        </div>
      </section>

      <section className="panel azure-scan-summary">
        <div className="finding-summary">
          <div>
            <span>Healthy</span>
            <strong>{summary.healthyResources}</strong>
          </div>

          <div>
            <span>Not Scanned</span>
            <strong>{summary.notScannedResources}</strong>
          </div>

          <div>
            <span>High Risk</span>
            <strong>{summary.highRiskResources}</strong>
          </div>

          <div>
            <span>Critical Risk</span>
            <strong>{summary.criticalResources}</strong>
          </div>
        </div>
      </section>

      {loading ? (
        <article className="panel resources-panel">
          <div className="empty-state">
            <h3>Loading Azure resources...</h3>

            <p>
              CloudGuard is querying Azure Resource Graph
              and running security checks.
            </p>
          </div>
        </article>
      ) : error ? (
        <article className="panel resources-panel">
          <div className="empty-state">
            <h3>Unable to load Azure resources</h3>

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
                  isSelected={
                    selectedResource?.id === resource.id
                  }
                  onSelect={handleSelectResource}
                />
              ))}
            </div>

            {filteredResources.length === 0 && (
              <article className="panel">
                <div className="empty-state small">
                  <h3>No matching Azure resources</h3>

                  <p>
                    Change the search text or filters and
                    try again.
                  </p>
                </div>
              </article>
            )}
          </section>

          <ResourceDetails
            key={selectedResource?.id || "no-resource"}
            resource={selectedResource}
          />
        </>
      )}
    </main>
  );
}

export default Resources;