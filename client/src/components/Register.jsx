// src/components/Register.jsx

import { useState } from "react";
import { useAuthUser } from "../security/AuthContext";
import { useNavigate } from "react-router-dom";
import "../style/auth.css"; // Import common auth styles

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { register } = useAuthUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(email, password, name);
    // Redirect to posts page after registration
    navigate("/app/posts");
  };

  return (
    <div className="auth-container">
      <h1>Register</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />
        <input type="submit" value="Register" />
      </form>
    </div>
  );
}