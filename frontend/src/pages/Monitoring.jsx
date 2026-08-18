import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import MetricTrendChart from "../components/MetricTrendChart";
import { getMetrics } from "../services/api";

function Monitoring() {
  const [monitorData, setMonitorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadMetrics = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMetrics();

        if (!cancelled) {
          setMonitorData(data);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError.message ||
              "Unable to load Azure Monitor metrics."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadMetrics();

    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = monitorData?.metrics || {};

  const requestHistory =
    monitorData?.history?.requests || [];

  const memoryMiB = useMemo(() => {
    const bytes =
      metrics.memoryWorkingSetBytes;

    if (typeof bytes !== "number") {
      return 0;
    }

    return bytes / (1024 * 1024);
  }, [metrics.memoryWorkingSetBytes]);

  const responseTimeMs = useMemo(() => {
    const seconds =
      metrics.responseTimeSeconds;

    if (typeof seconds !== "number") {
      return 0;
    }

    return seconds * 1000;
  }, [metrics.responseTimeSeconds]);

  const healthStatus = useMemo(() => {
    const health =
      metrics.healthCheckStatus;

    if (
      health === null ||
      health === undefined
    ) {
      return "Unavailable";
    }

    if (health >= 1) {
      return "Healthy";
    }

    return "Unhealthy";
  }, [metrics.healthCheckStatus]);

  const errorRate = useMemo(() => {
    const requests =
      metrics.requests || 0;

    const errors =
      (metrics.http4xx || 0) +
      (metrics.http5xx || 0);

    if (requests === 0) {
      return 0;
    }

    return (errors / requests) * 100;
  }, [
    metrics.requests,
    metrics.http4xx,
    metrics.http5xx,
  ]);

  if (loading) {
    return (
      <main className="dashboard">
        <article className="panel">
          <div className="empty-state">
            <h3>
              Loading Azure Monitor metrics...
            </h3>

            <p>
              CloudGuard is retrieving live
              platform telemetry.
            </p>
          </div>
        </article>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard">
        <article className="panel">
          <div className="empty-state">
            <h3>
              Unable to load monitoring data
            </h3>

            <p>{error}</p>
          </div>
        </article>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">
            Azure Monitor
          </p>

          <h1>Monitoring</h1>

          <span>
            Live Azure platform metrics and
            operational telemetry for monitored
            application resources.
          </span>
        </div>

        <div className="api-badge">
          <span className="status-dot"></span>
          Live Metrics
        </div>
      </header>

      <section className="stats-grid">
        <StatCard
          title="Requests"
          value={metrics.requests ?? 0}
          description="Requests during the last hour"
        />

        <StatCard
          title="HTTP 4xx"
          value={metrics.http4xx ?? 0}
          description="Client-side HTTP errors"
        />

        <StatCard
          title="HTTP 5xx"
          value={metrics.http5xx ?? 0}
          description="Server-side HTTP errors"
        />

        <StatCard
          title="Error Rate"
          value={`${errorRate.toFixed(2)}%`}
          description="4xx and 5xx request ratio"
        />
      </section>

      <section className="stats-grid">
        <StatCard
          title="Response Time"
          value={`${responseTimeMs.toFixed(2)} ms`}
          description="Average request response time"
        />

        <StatCard
          title="CPU Time"
          value={`${(
            metrics.cpuTimeSeconds ?? 0
          ).toFixed(2)} s`}
          description="CPU consumed during the period"
        />

        <StatCard
          title="Memory Working Set"
          value={`${memoryMiB.toFixed(2)} MiB`}
          description="Average application memory"
        />

        <StatCard
          title="Health Check"
          value={healthStatus}
          description="Azure App Service health signal"
        />
      </section>

      <article className="panel monitoring-chart-panel">
        <div className="panel-heading">
          <div>
            <h2>Request Trend</h2>

            <p>
              Azure Monitor request volume in
              5-minute intervals during the last hour.
            </p>
          </div>
        </div>

        <MetricTrendChart
          data={requestHistory}
        />
      </article>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>
                Application Telemetry
              </h2>

              <p>
                Aggregated operational metrics
                returned by Azure Monitor.
              </p>
            </div>
          </div>

          <div className="system-row">
            <span>Total Requests</span>

            <strong>
              {metrics.requests ?? 0}
            </strong>
          </div>

          <div className="system-row">
            <span>HTTP 4xx Errors</span>

            <strong>
              {metrics.http4xx ?? 0}
            </strong>
          </div>

          <div className="system-row">
            <span>HTTP 5xx Errors</span>

            <strong>
              {metrics.http5xx ?? 0}
            </strong>
          </div>

          <div className="system-row">
            <span>Error Rate</span>

            <strong>
              {errorRate.toFixed(2)}%
            </strong>
          </div>

          <div className="system-row">
            <span>
              Average Response Time
            </span>

            <strong>
              {responseTimeMs.toFixed(2)} ms
            </strong>
          </div>

          <div className="system-row">
            <span>CPU Time</span>

            <strong>
              {(
                metrics.cpuTimeSeconds ??
                0
              ).toFixed(2)} seconds
            </strong>
          </div>

          <div className="system-row">
            <span>
              Memory Working Set
            </span>

            <strong>
              {memoryMiB.toFixed(2)} MiB
            </strong>
          </div>

          <div className="system-row">
            <span>Health Check</span>

            <strong>
              {healthStatus}
            </strong>
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>
                Monitored Resource
              </h2>

              <p>
                Azure resource currently used
                for live platform telemetry.
              </p>
            </div>
          </div>

          <div className="system-row">
            <span>Name</span>

            <strong>
              {monitorData?.resource?.name ||
                "—"}
            </strong>
          </div>

          <div className="system-row">
            <span>Type</span>

            <strong>
              {monitorData?.resource?.type ||
                "—"}
            </strong>
          </div>

          <div className="system-row">
            <span>
              Resource Group
            </span>

            <strong>
              {monitorData?.resource
                ?.resourceGroup || "—"}
            </strong>
          </div>

          <div className="system-row">
            <span>Region</span>

            <strong>
              {monitorData?.resource?.region ||
                "—"}
            </strong>
          </div>

          <div className="system-row">
            <span>
              Metric Namespace
            </span>

            <strong>
              {monitorData?.resource
                ?.namespace || "—"}
            </strong>
          </div>

          <div className="system-row">
            <span>Source</span>

            <strong>
              {monitorData?.source ||
                "Azure Monitor"}
            </strong>
          </div>

          <div className="system-row">
            <span>Query Window</span>

            <strong>
              {monitorData?.period?.label ||
                "—"}
            </strong>
          </div>

          <div className="system-row">
            <span>
              Metric Interval
            </span>

            <strong>
              {monitorData?.period
                ?.interval || "—"}
            </strong>
          </div>

          <div className="system-row">
            <span>Retrieved At</span>

            <strong>
              {monitorData?.retrievedAt
                ? new Date(
                    monitorData.retrievedAt
                  ).toLocaleString()
                : "—"}
            </strong>
          </div>
        </article>
      </section>
    </main>
  );
}

export default Monitoring;