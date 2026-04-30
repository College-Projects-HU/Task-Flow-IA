import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import CreateUserModal from "../components/CreateUserModal";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPendingUsers = async () => {
    try {
      // 'api' already has baseURL '/api' and handles the auth token
      const response = await api.get("/admin/pending-users");
      // Ensure we always deal with an array to prevent .map crashes
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        setUsers([]);
        console.error("API returned non-array data:", response.data);
        setError("Invalid response format from server.");
      }
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch pending users.");
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/users/${id}/approve`);
      fetchPendingUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to approve user.");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject and delete this user?")) return;
    
    try {
      await api.put(`/admin/users/${id}/reject`);
      fetchPendingUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to reject user.");
    }
  };

  return (
    <DashboardLayout
      title="Admin Dashboard"
      activeItem="admin"
      subtitle="Manage Pending Project Managers"
    >
      {error && <div className="dashboard-error">{error}</div>}
      
      <section className="dashboard-grid">
        <article className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
          <div className="dashboard-card-header">
            <h4>Pending Users</h4>
          </div>
          {users.length === 0 ? (
            <p className="dashboard-muted" style={{ padding: '1.5rem' }}>No pending users at the moment.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '1rem' }}>Name</th>
                    <th style={{ padding: '1rem' }}>Email</th>
                    <th style={{ padding: '1rem' }}>Registration Date</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #f3f7fc', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '1rem', fontWeight: '500', color: '#1f2937' }}>{user.fullName}</td>
                      <td style={{ padding: '1rem', color: '#4b5563' }}>{user.email}</td>
                      <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            className="dashboard-link-btn" 
                            style={{ background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                            onClick={() => handleApprove(user.id)}
                          >
                            Approve
                          </button>
                          <button 
                            className="dashboard-link-btn" 
                            style={{ background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                            onClick={() => handleReject(user.id)}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ padding: '1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-start' }}>
            <button 
              className="dashboard-link-btn" 
              style={{ background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer', padding: '0.6rem 1.2rem', fontSize: '0.875rem', borderRadius: '0.375rem' }}
              onClick={() => setIsModalOpen(true)}
            >
              Create User
            </button>
          </div>
        </article>
      </section>

      <CreateUserModal 
        show={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
        onSuccess={fetchPendingUsers}
      />
    </DashboardLayout>
  );
}
