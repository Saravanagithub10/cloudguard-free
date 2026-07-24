import { Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";

function PlaceholderPage({ title, description }) {
  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">CloudGuard Free Edition</p>
          <h1>{title}</h1>
          <span>{description}</span>
        </div>
      </header>

      <section className="panel placeholder-panel">
        <div className="empty-state">
          <h3>{title}</h3>
          <p>This module will be implemented soon.</p>
        </div>
      </section>
    </main>
  );
}

function App() {
  return (
    <div className="app-layout">
      <Sidebar />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/incidents"
          element={
            <PlaceholderPage
              title="Incidents"
              description="Track and manage cloud security incidents."
            />
          }
        />

        <Route
          path="/alerts"
          element={
            <PlaceholderPage
              title="Alerts"
              description="Review generated security alerts."
            />
          }
        />

        <Route
          path="/resources"
          element={
            <PlaceholderPage
              title="Resources"
              description="Inspect monitored Azure resources."
            />
          }
        />

        <Route
          path="/activity-logs"
          element={
            <PlaceholderPage
              title="Activity Logs"
              description="Review CloudGuard security activity."
            />
          }
        />

        <Route
          path="/reports"
          element={
            <PlaceholderPage
              title="Reports"
              description="View cloud security reports."
            />
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;