import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

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
    <div className="container mt-5">
      <h2>Admin Dashboard - Pending Project Managers</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      {users.length === 0 ? (
        <p>No pending users at the moment.</p>
      ) : (
        <div className="table-responsive mt-4">
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Registration Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn btn-success btn-sm me-2" 
                      onClick={() => handleApprove(user.id)}
                    >
                      Approve
                    </button>
                    <button 
                      className="btn btn-danger btn-sm" 
                      onClick={() => handleReject(user.id)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
