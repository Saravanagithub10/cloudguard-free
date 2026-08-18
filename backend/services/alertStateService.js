const fs = require("fs");
const path = require("path");

const STATE_FILE = path.join(
  __dirname,
  "../data/alert-state.json"
);

const ensureStateFile = () => {
  const directory = path.dirname(STATE_FILE);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, {
      recursive: true,
    });
  }

  if (!fs.existsSync(STATE_FILE)) {
    fs.writeFileSync(
      STATE_FILE,
      JSON.stringify(
        {
          alerts: {},
        },
        null,
        2
      ),
      "utf8"
    );
  }
};

const readAlertState = () => {
  try {
    ensureStateFile();

    const raw = fs.readFileSync(
      STATE_FILE,
      "utf8"
    );

    const parsed = JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.alerts ||
      typeof parsed.alerts !== "object"
    ) {
      return {
        alerts: {},
      };
    }

    return parsed;
  } catch (error) {
    console.error(
      "Unable to read alert state:",
      error.message
    );

    return {
      alerts: {},
    };
  }
};

const writeAlertState = (state) => {
  ensureStateFile();

  fs.writeFileSync(
    STATE_FILE,
    JSON.stringify(
      state,
      null,
      2
    ),
    "utf8"
  );
};

const getAlertState = (alertId) => {
  const state = readAlertState();

  return state.alerts?.[alertId] || null;
};

const saveAlertState = (alert) => {
  if (!alert?.id) {
    return;
  }

  const state = readAlertState();

  state.alerts[alert.id] = {
    status:
      alert.status || "Active",

    createdAt:
      alert.createdAt || null,

    acknowledgedAt:
      alert.acknowledgedAt || null,

    resolvedAt:
      alert.resolvedAt || null,

    resolutionNote:
      alert.resolutionNote || "",

    emailNotificationSent:
      alert.emailNotificationSent ?? false,

    emailNotifiedAt:
      alert.emailNotifiedAt ?? null,

    notificationError:
      alert.notificationError ?? null,

    activity:
      Array.isArray(alert.activity)
        ? alert.activity
        : [],
  };

  writeAlertState(state);
};

const saveAlertsState = (alerts = []) => {
  const state = readAlertState();

  alerts.forEach((alert) => {
    if (!alert?.id) {
      return;
    }

    state.alerts[alert.id] = {
      status:
        alert.status || "Active",

      createdAt:
        alert.createdAt || null,

      acknowledgedAt:
        alert.acknowledgedAt || null,

      resolvedAt:
        alert.resolvedAt || null,

      resolutionNote:
        alert.resolutionNote || "",

      emailNotificationSent:
        alert.emailNotificationSent ?? false,

      emailNotifiedAt:
        alert.emailNotifiedAt ?? null,

      notificationError:
        alert.notificationError ?? null,

      activity:
        Array.isArray(alert.activity)
          ? alert.activity
          : [],
    };
  });

  writeAlertState(state);
};

module.exports = {
  getAlertState,
  saveAlertState,
  saveAlertsState,
};