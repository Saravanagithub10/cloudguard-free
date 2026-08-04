import { useEffect, useMemo, useState } from "react";
import ActivityLogCard from "../components/ActivityLogCard";
import { getActivities } from "../services/api";

function ActivityLogs() {
  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [entityFilter, setEntityFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadActivities = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getActivities();

        if (cancelled) {
          return;
        }

        setActivities(
          Array.isArray(data?.activities)
            ? data.activities
            : []
        );

        setSummary(data?.summary || null);
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.message ||
              "Unable to load activity logs."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadActivities();

    return () => {
      cancelled = true;
    };
  }, []);

  const actionOptions = useMemo(
    () => [
      "All",
      ...new Set(
        activities
          .map((activity) => activity.action)
          .filter(Boolean)
      ),
    ],
    [activities]
  );

  const filteredActivities = useMemo(() => {
    const searchValue = searchTerm.toLowerCase().trim();

    return activities.filter((activity) => {
      const entityId =
        activity.entityId?.toLowerCase() || "";

      const message =
        activity.message?.toLowerCase() || "";

      const resourceName =
        activity.resourceName?.toLowerCase() || "";

      const matchesSearch =
        entityId.includes(searchValue) ||
        message.includes(searchValue) ||
        resourceName.includes(searchValue);

      const matchesEntity =
        entityFilter === "All" ||
        activity.entityType === entityFilter;

      const matchesAction =
        actionFilter === "All" ||
        activity.action === actionFilter;

      return (
        matchesSearch &&
        matchesEntity &&
        matchesAction
      );
    });
  }, [
    activities,
    searchTerm,
    entityFilter,
    actionFilter,
  ]);

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Audit and Monitoring</p>
          <h1>Activity Logs</h1>

          <span>
            Review alert and incident activity across
            CloudGuard.
          </span>
        </div>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <p className="stat-title">
            Total Activities
          </p>

          <h3>{summary?.totalActivities ?? 0}</h3>
          <span>All audit events</span>
        </article>

        <article className="stat-card">
          <p className="stat-title">
            Alert Activities
          </p>

          <h3>{summary?.alertActivities ?? 0}</h3>
          <span>Alert lifecycle events</span>
        </article>

        <article className="stat-card">
          <p className="stat-title">
            Incident Activities
          </p>

          <h3>
            {summary?.incidentActivities ?? 0}
          </h3>

          <span>Incident workflow events</span>
        </article>

        <article className="stat-card">
          <p className="stat-title">
            Resolved / Closed
          </p>

          <h3>
            {(summary?.resolvedActivities ?? 0) +
              (summary?.closedActivities ?? 0)}
          </h3>

          <span>Completed workflow actions</span>
        </article>
      </section>

      <section className="panel activity-controls-panel">
        <div className="resource-controls">
          <input
            type="search"
            placeholder="Search IDs, messages or resources"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />

          <select
            value={entityFilter}
            onChange={(event) =>
              setEntityFilter(event.target.value)
            }
          >
            <option value="All">All entities</option>
            <option value="Alert">Alerts</option>
            <option value="Incident">Incidents</option>
          </select>

          <select
            value={actionFilter}
            onChange={(event) =>
              setActionFilter(event.target.value)
            }
          >
            {actionOptions.map((action) => (
              <option key={action} value={action}>
                {action === "All"
                  ? "All actions"
                  : action}
              </option>
            ))}
          </select>
        </div>
      </section>

      {loading ? (
        <article className="panel resources-panel">
          <div className="empty-state">
            <h3>Loading activity logs...</h3>
            <p>CloudGuard is building the audit trail.</p>
          </div>
        </article>
      ) : error ? (
        <article className="panel resources-panel">
          <div className="empty-state">
            <h3>Unable to load activity logs</h3>
            <p>{error}</p>
          </div>
        </article>
      ) : filteredActivities.length === 0 ? (
        <article className="panel resources-panel">
          <div className="empty-state">
            <h3>No matching activity logs</h3>
            <p>Change your filters and try again.</p>
          </div>
        </article>
      ) : (
        <section className="activity-log-list">
          {filteredActivities.map((activity) => (
            <ActivityLogCard
              key={activity.id}
              activity={activity}
            />
          ))}
        </section>
      )}
    </main>
  );
}

export default ActivityLogs;