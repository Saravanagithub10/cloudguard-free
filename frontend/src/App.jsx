import { Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Resources from "./pages/Resources";
import Alerts from "./pages/Alerts";
import Incidents from "./pages/Incidents";
import ActivityLogs from "./pages/ActivityLogs";
import Reports from "./pages/Reports";

function App() {
  return (
    <div className="app-layout">
      <Sidebar />

      <Routes>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/resources"
          element={<Resources />}
        />

        <Route
          path="/alerts"
          element={<Alerts />}
        />

        <Route
          path="/incidents"
          element={<Incidents />}
        />

        <Route
          path="/activity-logs"
          element={<ActivityLogs />}
        />

        <Route
          path="/reports"
          element={<Reports />}
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </div>
  );
}

export default App;