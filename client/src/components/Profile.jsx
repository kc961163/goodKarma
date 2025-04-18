// src/components/Profile.jsx
import { useAuthUser } from "../security/AuthContext";

export default function Profile() {
  const { user } = useAuthUser();

  return (
    <div className="card">
      <h1>My Profile</h1>
      
      <div className="profile-info">
        <div className="profile-field">
          <span className="profile-label">Name:</span>
          <span className="profile-value">{user?.name || "Not provided"}</span>
        </div>
        
        <div className="profile-field">
          <span className="profile-label">Email:</span>
          <span className="profile-value">{user?.email}</span>
        </div>
        
        <div className="profile-stats">
          <h2>Karma Stats</h2>
          <p>This is where your karma statistics will be displayed.</p>
        </div>
      </div>
    </div>
  );
}