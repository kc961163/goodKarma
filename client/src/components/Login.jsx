// /src/components/Login.jsx

import { useState } from "react";
import { useAuthUser } from "../security/AuthContext";
import { useNavigate } from "react-router-dom";
import "../style/auth.css"; // Import common auth styles

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuthUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
    // Redirect to posts page instead of profile page
    navigate("/app/posts");
  };

  return (
    <div className="auth-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <input type="submit" value="Login" />
      </form>
    </div>
  );
}

export default Login;