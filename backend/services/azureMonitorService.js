const {
  DefaultAzureCredential,
} = require("@azure/identity");

const {
  MetricsClient,
} = require("@azure/monitor-query-metrics");

const credential = new DefaultAzureCredential();

const METRICS_ENDPOINT =
  "https://centralindia.metrics.monitor.azure.com";

const METRIC_NAMESPACE =
  "Microsoft.Web/sites";

const metricsClient =
  new MetricsClient(
    METRICS_ENDPOINT,
    credential
  );

// ========================================
// HELPERS
// ========================================

const getMetricDataPoints = (metric) => {
  const timeSeries =
    Array.isArray(metric?.timeseries)
      ? metric.timeseries
      : [];

  return timeSeries.flatMap((series) =>
    Array.isArray(series?.data)
      ? series.data
      : []
  );
};

const sumMetricValues = (
  metric,
  aggregation = "total"
) => {
  const points =
    getMetricDataPoints(metric);

  return points.reduce(
    (sum, point) => {
      const value =
        point?.[aggregation];

      return (
        sum +
        (typeof value === "number"
          ? value
          : 0)
      );
    },
    0
  );
};

const averageMetricValues = (
  metric,
  aggregation = "average"
) => {
  const points =
    getMetricDataPoints(metric);

  const values = points
    .map(
      (point) =>
        point?.[aggregation]
    )
    .filter(
      (value) =>
        typeof value === "number"
    );

  if (values.length === 0) {
    return null;
  }

  const total =
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  return total / values.length;
};

const findMetric = (
  metrics,
  metricName
) => {
  return metrics.find(
    (metric) => {
      const name =
        typeof metric?.name ===
        "string"
          ? metric.name
          : metric?.name?.value;

      return name === metricName;
    }
  );
};

const queryMetricGroup = async (
  resourceId,
  metricNames,
  aggregation,
  startTime,
  endTime
) => {
  const results =
    await metricsClient.queryResources(
      [resourceId],
      metricNames,
      METRIC_NAMESPACE,
      {
        aggregation,
        startTime,
        endTime,
        interval: "PT5M",
      }
    );

  return Array.isArray(results)
    ? results[0]
    : null;
};

// ========================================
// HISTORY BUILDER
// ========================================

const buildRequestHistory = (
  requestsMetric
) => {
  const points =
    getMetricDataPoints(
      requestsMetric
    );

  return points.map((point) => ({
    timestamp:
      point.timeStamp ||
      point.timestamp ||
      null,

    requests:
      typeof point.total === "number"
        ? point.total
        : 0,
  }));
};

// ========================================
// APP SERVICE METRICS
// ========================================

const getAppServiceMetrics = async (
  resourceId
) => {
  if (!resourceId) {
    throw new Error(
      "Azure resource ID is required."
    );
  }

  const endTime = new Date();

  const startTime =
    new Date(
      endTime.getTime() -
        60 * 60 * 1000
    );

  const countResult =
    await queryMetricGroup(
      resourceId,
      [
        "Requests",
        "Http4xx",
        "Http5xx",
        "CpuTime",
      ],
      "Total",
      startTime,
      endTime
    );

  const averageResult =
    await queryMetricGroup(
      resourceId,
      [
        "HttpResponseTime",
        "MemoryWorkingSet",
        "HealthCheckStatus",
      ],
      "Average",
      startTime,
      endTime
    );

  if (
    !countResult &&
    !averageResult
  ) {
    throw new Error(
      "Azure Monitor returned no metric data."
    );
  }

  const countMetrics =
    Array.isArray(
      countResult?.metrics
    )
      ? countResult.metrics
      : [];

  const averageMetrics =
    Array.isArray(
      averageResult?.metrics
    )
      ? averageResult.metrics
      : [];

  const requests =
    findMetric(
      countMetrics,
      "Requests"
    );

  const http4xx =
    findMetric(
      countMetrics,
      "Http4xx"
    );

  const http5xx =
    findMetric(
      countMetrics,
      "Http5xx"
    );

  const cpuTime =
    findMetric(
      countMetrics,
      "CpuTime"
    );

  const responseTime =
    findMetric(
      averageMetrics,
      "HttpResponseTime"
    );

  const memory =
    findMetric(
      averageMetrics,
      "MemoryWorkingSet"
    );

  const healthCheck =
    findMetric(
      averageMetrics,
      "HealthCheckStatus"
    );

  const requestCount =
    sumMetricValues(
      requests,
      "total"
    );

  const http4xxCount =
    sumMetricValues(
      http4xx,
      "total"
    );

  const http5xxCount =
    sumMetricValues(
      http5xx,
      "total"
    );

  const cpuTimeSeconds =
    sumMetricValues(
      cpuTime,
      "total"
    );

  const responseTimeSeconds =
    averageMetricValues(
      responseTime,
      "average"
    );

  const memoryWorkingSetBytes =
    averageMetricValues(
      memory,
      "average"
    );

  const healthCheckStatus =
    averageMetricValues(
      healthCheck,
      "average"
    );

  const requestHistory =
    buildRequestHistory(
      requests
    );

  return {
    source:
      "Azure Monitor",

    period: {
      label:
        "Last 1 hour",

      startTime:
        startTime.toISOString(),

      endTime:
        endTime.toISOString(),

      interval:
        "PT5M",
    },

    resource: {
      id:
        resourceId,

      namespace:
        countResult?.namespace ||
        averageResult?.namespace ||
        METRIC_NAMESPACE,

      region:
        countResult?.resourceRegion ||
        averageResult?.resourceRegion ||
        "centralindia",
    },

    metrics: {
      requests:
        requestCount,

      http4xx:
        http4xxCount,

      http5xx:
        http5xxCount,

      responseTimeSeconds:
        responseTimeSeconds ??
        0,

      cpuTimeSeconds,

      memoryWorkingSetBytes:
        memoryWorkingSetBytes ??
        0,

      healthCheckStatus,
    },

    history: {
      requests:
        requestHistory,
    },

    retrievedAt:
      new Date().toISOString(),
  };
};

module.exports = {
  getAppServiceMetrics,
};