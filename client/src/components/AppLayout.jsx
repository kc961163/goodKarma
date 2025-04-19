// src/components/AppLayout.jsx

import { useAuthUser } from "../security/AuthContext";
import { useNavigate, Outlet, Link, NavLink } from "react-router-dom";

import "../style/appLayout.css";

export default function AppLayout() {
  const { user, logout } = useAuthUser();
  const navigate = useNavigate();

  return (
    <div className="app">
      <div className="title">
        {/* Renamed the application title from NEU TODOs App to GoodKarma */}
        <h1>GoodKarma</h1>
      </div>
      <div className="header">
      <nav className="menu">
  <ul className="menu-list">
    <li>
      <NavLink to="/app/feed" className={({ isActive }) => isActive ? "active-link" : ""}>Feed</NavLink>
    </li>
    <li>
      <NavLink to="/app/posts" className={({ isActive }) => isActive ? "active-link" : ""}>My Posts</NavLink>
    </li>
    <li>
      <NavLink to="/app/profile" className={({ isActive }) => isActive ? "active-link" : ""}>Profile</NavLink>
    </li>
    <li>
      <button
        className="exit-button"
        onClick={async () => {
          await logout();
          navigate("/");
        }}
      >
        LogOut
      </button>
    </li>
  </ul>
</nav>
        <div>Welcome 👋 {user?.name}</div>
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}