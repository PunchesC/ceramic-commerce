import React from 'react';


// Example model for admin dashboard stats
interface AdminDashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC = () => {
  // In a real app, fetch stats from API
  const stats: AdminDashboardStats = {
    totalUsers: 42,
    totalOrders: 123,
    totalProducts: 17,
    totalRevenue: 9876.54,
  };
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Dashboard</h1>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div><strong>Total Users:</strong> {stats.totalUsers}</div>
        <div><strong>Total Orders:</strong> {stats.totalOrders}</div>
        <div><strong>Total Products:</strong> {stats.totalProducts}</div>
        <div><strong>Total Revenue:</strong> ${stats.totalRevenue.toLocaleString()}</div>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <h2>Quick Links</h2>
        <ul>
          <li><a href="/admin/products">Manage Products</a></li>
          <li><a href="/admin/orders">Manage Orders</a></li>
          <li><a href="/admin/users">Manage Users</a></li>
          <li><a href="/admin/settings">Site Settings</a></li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
