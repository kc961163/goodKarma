// src/components/Home.jsx

import { useAuthUser } from "../security/AuthContext";
import { useNavigate } from "react-router-dom";

import "../style/home.css";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthUser();

  return (
    <div className="home">
      {/* Changed "TODOs App" to "GoodKarma" */}
      <h1>GoodKarma</h1>
      <div>
        {!isAuthenticated ? (
          <button className="btn-primary" onClick={() => navigate("/login")}>
            Login
          </button>
        ) : (
          <button className="btn-primary" onClick={() => navigate("/app/posts")}>
            Enter App
          </button>
        )}
      </div>
      <div>
        <button className="btn-secondary" onClick={() => navigate("/register")}>
          Create Account
        </button>
      </div>
    </div>
  );
}