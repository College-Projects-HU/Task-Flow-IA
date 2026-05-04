import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getSystemUsers, updateSystemUserRole, updateSystemUserPermissions, deleteSystemUser } from "../services/api";
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
    const [pendingPermissionChanges, setPendingPermissionChanges] = useState({});
    
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

    const handlePermissionChange = (userId, field, checked) => {
        setPendingPermissionChanges(prev => {
            const existing = prev[userId] || {};
            return {
                ...prev,
                [userId]: {
                    ...existing,
                    [field]: checked
                }
            };
        });
    };

    const savePermissionChange = async (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const pending = pendingPermissionChanges[userId] || {};
        const payload = {
            canInteractWithTasks: pending.canInteractWithTasks ?? user.canInteractWithTasks,
            canComment: pending.canComment ?? user.canComment,
            canAttachFiles: pending.canAttachFiles ?? user.canAttachFiles
        };

        try {
            const res = await updateSystemUserPermissions(userId, payload);
            setSuccessMsg(res.message || "Permissions updated successfully.");

            setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...payload } : u));

            setPendingPermissionChanges(prev => {
                const updated = { ...prev };
                delete updated[userId];
                return updated;
            });

            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update permissions.");
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleRejectUser = async (userId) => {
        const confirmed = window.confirm("Reject this user? This will deactivate the account.");
        if (!confirmed) return;

        try {
            const res = await deleteSystemUser(userId);
            setSuccessMsg(res.message || "User moved to rejected list.");
            setUsers(prev => prev.filter(u => u.id !== userId));
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reject user.");
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
                    <p>No approved users found.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="dashboard-table table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Can Interact Tasks</th>
                                    <th>Can Comment</th>
                                    <th>Can Attach Files</th>
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

                                    const pendingPerms = pendingPermissionChanges[u.id] || {};
                                    const currentCanInteract = pendingPerms.canInteractWithTasks ?? u.canInteractWithTasks;
                                    const currentCanComment = pendingPerms.canComment ?? u.canComment;
                                    const currentCanAttach = pendingPerms.canAttachFiles ?? u.canAttachFiles;

                                    const permissionsChanged =
                                        currentCanInteract !== u.canInteractWithTasks ||
                                        currentCanComment !== u.canComment ||
                                        currentCanAttach !== u.canAttachFiles;

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
                                                        style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', marginTop: '8px', display: 'block' }}
                                                    >
                                                        Save Role
                                                    </button>
                                                )}
                                            </td>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={currentCanInteract}
                                                    disabled={isSelf}
                                                    onChange={(e) => handlePermissionChange(u.id, "canInteractWithTasks", e.target.checked)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={currentCanComment}
                                                    disabled={isSelf}
                                                    onChange={(e) => handlePermissionChange(u.id, "canComment", e.target.checked)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={currentCanAttach}
                                                    disabled={isSelf}
                                                    onChange={(e) => handlePermissionChange(u.id, "canAttachFiles", e.target.checked)}
                                                />
                                            </td>
                                            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {permissionsChanged && (
                                                    <button 
                                                        className="btn-sm"
                                                        onClick={() => savePermissionChange(u.id)}
                                                        style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                                    >
                                                        Save Permissions
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    className="btn-sm"
                                                    onClick={() => handleRejectUser(u.id)}
                                                    disabled={isSelf}
                                                    style={{
                                                        backgroundColor: isSelf ? '#fca5a5' : '#dc2626',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '4px 10px',
                                                        borderRadius: '4px',
                                                        cursor: isSelf ? 'not-allowed' : 'pointer'
                                                    }}
                                                >
                                                    Delete User
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