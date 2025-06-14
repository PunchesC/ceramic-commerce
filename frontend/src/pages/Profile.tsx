import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../models/UserProfile';

const Profile: React.FC = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://localhost:7034'}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
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
  }, [token]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!profile) return <div>No profile found.</div>;

  return (
    <div>
      <h2>Your Profile</h2>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Admin:</strong> {profile.isAdmin ? 'Yes' : 'No'}</p>
    </div>
  );
};

export default Profile;