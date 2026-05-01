import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getSystemUsers, updateSystemUserRole, deleteSystemUser } from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import CreateUserModal from "../components/CreateUserModal";
import "../App.css";

const ROLES = {
  ADMIN: 0,
  PROJECT_MANAGER: 1,
  MEMBER: 2
};

const SystemUsersPage = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [pendingRoleChanges, setPendingRoleChanges] = useState({});
    
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

    const loggedInUserId = user?.id ? parseInt(user.id) : null;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await getSystemUsers();
            setUsers(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load system users.");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = (userId, newRoleStr) => {
        const newRole = parseInt(newRoleStr);
        setPendingRoleChanges(prev => ({
            ...prev,
            [userId]: newRole
        }));
    };

    const saveRoleChange = async (userId) => {
        const newRole = pendingRoleChanges[userId];
        if (newRole === undefined) return;

        try {
            const res = await updateSystemUserRole(userId, newRole);
            setSuccessMsg(res.message || "Role updated successfully.");
            
            if (newRole === ROLES.PROJECT_MANAGER) {
                setUsers(prev => prev.filter(u => u.id !== userId));
            } else {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            }
            
            setPendingRoleChanges(prev => {
                const updated = { ...prev };
                delete updated[userId];
                return updated;
            });

            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update role.");
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleDelete = async (userId) => {
        const confirmed = window.confirm("Are you sure you want to remove this user? This will set their status to rejected.");
        if (!confirmed) return;

        try {
            const res = await deleteSystemUser(userId);
            setSuccessMsg(res.message || "User moved to rejected list.");
            setUsers(prev => prev.filter(u => u.id !== userId));
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete user.");
            setTimeout(() => setError(null), 3000);
        }
    };

    return (
        <DashboardLayout activeItem="system-users" title="System Users">
            <div className="dashboard-content">
                <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>System Users</h2>
                    <button 
                        className="create-btn" 
                        onClick={() => setIsCreateUserModalOpen(true)}
                    >
                        Create User
                    </button>
                </div>
                
                {error && <div className="dashboard-error">{error}</div>}
                {successMsg && <div className="dashboard-success" style={{ backgroundColor: '#28a745', color: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>{successMsg}</div>}

                {loading ? (
                    <p>Loading users...</p>
                ) : users.length === 0 ? (
                    <p>No active users found.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="dashboard-table table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Registration Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => {
                                    const isSelf = u.id === loggedInUserId;
                                    
                                    const currentSelectedRole = pendingRoleChanges[u.id] !== undefined 
                                        ? pendingRoleChanges[u.id] 
                                        : u.role;
                                        
                                    const roleChanged = pendingRoleChanges[u.id] !== undefined && pendingRoleChanges[u.id] !== u.role;

                                    return (
                                        <tr key={u.id}>
                                            <td>{u.fullName}</td>
                                            <td>{u.email}</td>
                                            <td>
                                                <select 
                                                    value={currentSelectedRole}
                                                    disabled={isSelf}
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                    className="form-select role-select"
                                                    style={{ display: 'inline-block', width: 'auto', marginRight: '10px' }}
                                                >
                                                    <option value={ROLES.ADMIN}>Admin</option>
                                                    <option value={ROLES.PROJECT_MANAGER}>Project Manager</option>
                                                    <option value={ROLES.MEMBER}>Member</option>
                                                </select>
                                                {roleChanged && (
                                                    <button 
                                                        className="btn-sm"
                                                        onClick={() => saveRoleChange(u.id)}
                                                        style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                                    >
                                                        Save
                                                    </button>
                                                )}
                                            </td>
                                            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button 
                                                    className="btn-sm"
                                                    disabled={isSelf}
                                                    onClick={() => handleDelete(u.id)}
                                                    style={{ backgroundColor: isSelf ? '#ccc' : '#dc3545', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: isSelf ? 'not-allowed' : 'pointer' }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <CreateUserModal
                show={isCreateUserModalOpen}
                handleClose={() => setIsCreateUserModalOpen(false)}
                onSuccess={() => {
                    setIsCreateUserModalOpen(false);
                    fetchUsers(); // Refresh list
                }}
            />
        </DashboardLayout>
    );
};

export default SystemUsersPage;