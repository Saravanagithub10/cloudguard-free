import { NavLink } from "react-router-dom";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    label: "Incidents",
    path: "/incidents",
  },
  {
    label: "Alerts",
    path: "/alerts",
  },
  {
    label: "Resources",
    path: "/resources",
  },
  {
    label: "Activity Logs",
    path: "/activity-logs",
  },
  {
    label: "Reports",
    path: "/reports",
  },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">CG</div>

        <div>
          <h2>CloudGuard</h2>
          <p>Free Edition</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;