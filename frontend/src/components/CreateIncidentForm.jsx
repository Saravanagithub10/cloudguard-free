import { useMemo, useState } from "react";

function CreateIncidentForm({
  alerts = [],
  onCreate,
  actionLoading = false,
}) {
  const firstAlert = alerts[0] || null;

  const initialFormData = useMemo(
    () => ({
      alertId: firstAlert?.id || "",
      title: firstAlert
        ? `${firstAlert.title} investigation`
        : "",
      description: firstAlert
        ? `Investigate the ${firstAlert.title.toLowerCase()} finding detected on ${firstAlert.resourceName}.`
        : "",
      assignedTo: "",
      priority: firstAlert?.severity || "High",
    }),
    [firstAlert]
  );

  const [formData, setFormData] = useState(initialFormData);

  const handleAlertChange = (event) => {
    const alertId = event.target.value;

    const selectedAlert = alerts.find(
      (alert) => alert.id === alertId
    );

    setFormData((current) => ({
      ...current,
      alertId,
      title: selectedAlert
        ? `${selectedAlert.title} investigation`
        : "",
      description: selectedAlert
        ? `Investigate the ${selectedAlert.title.toLowerCase()} finding detected on ${selectedAlert.resourceName}.`
        : "",
      priority: selectedAlert?.severity || "High",
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (typeof onCreate !== "function") {
      return;
    }

    const incidentData = {
      alertId: formData.alertId,
      title: formData.title.trim(),
      description: formData.description.trim(),
      assignedTo: formData.assignedTo.trim(),
      priority: formData.priority,
    };

    const success = await onCreate(incidentData);

    if (success) {
      setFormData((current) => ({
        ...current,
        assignedTo: "",
      }));
    }
  };

  if (alerts.length === 0) {
    return (
      <article className="panel create-incident-panel">
        <div className="empty-state small">
          <h3>No alerts available</h3>
          <p>All current alerts already have incidents.</p>
        </div>
      </article>
    );
  }

  return (
    <article className="panel create-incident-panel">
      <div className="panel-heading">
        <div>
          <h2>Create Incident</h2>
          <p>
            Convert a security alert into an investigation case.
          </p>
        </div>
      </div>

      <form className="incident-form" onSubmit={handleSubmit}>
        <label>
          Related Alert

          <select
            name="alertId"
            value={formData.alertId}
            onChange={handleAlertChange}
          >
            {alerts.map((alert) => (
              <option key={alert.id} value={alert.id}>
                {alert.severity} — {alert.title} —{" "}
                {alert.resourceName}
              </option>
            ))}
          </select>
        </label>

        <label>
          Incident Title

          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter incident title"
          />
        </label>

        <label>
          Description

          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the investigation"
          />
        </label>

        <div className="incident-form-row">
          <label>
            Assigned Analyst

            <input
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              placeholder="Example: Saravanan"
            />
          </label>

          <label>
            Priority

            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          className="primary-button"
          disabled={
            actionLoading ||
            !formData.alertId ||
            !formData.title.trim() ||
            !formData.description.trim() ||
            !formData.assignedTo.trim()
          }
        >
          {actionLoading ? "Creating..." : "Create Incident"}
        </button>
      </form>
    </article>
  );
}

export default CreateIncidentForm;