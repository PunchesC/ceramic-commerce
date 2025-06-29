import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../models/UserProfile';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetch(`${API_URL}/api/users/me`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
      })
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [user, navigate]);

  if (loading) return <div className="profile-card">Loading...</div>;
  if (error) return <div className="profile-card" style={{ color: 'red' }}>{error}</div>;
  if (!profile) return <div className="profile-card">No profile found.</div>;

  return (
    <div className="profile-card">
      <div className="profile-avatar">
        <span role="img" aria-label="avatar" style={{ fontSize: 48 }}>👤</span>
      </div>
      <h2>{profile.name}</h2>
      <div className="profile-info">
        <div><strong>Email:</strong> {profile.email}</div>
        {/* <div><strong>Admin:</strong> {profile.isAdmin ? 'Yes' : 'No'}</div> */}
      </div>
      <button className="profile-edit-btn" disabled>Edit Profile</button>
    </div>
  );
};

export default Profile;