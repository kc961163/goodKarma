// src/components/AppLayout.jsx

import { useAuthUser } from "../security/AuthContext";
import { useNavigate, Outlet, Link } from "react-router-dom";

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
              <Link to="/app/feed">Feed</Link>
            </li>
            <li>
              <Link to="/app">Profile</Link>
            </li>
            {/* Changed "TODOs" to "Posts" and the path from /app/todos to /app/posts */}
            <li>
              <Link to="/app/posts">Posts</Link>
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