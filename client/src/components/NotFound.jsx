// src/components/NotFound.jsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <div className="not-found-actions">
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    </div>
  );
}