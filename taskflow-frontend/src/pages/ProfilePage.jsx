import { useState, useEffect, useContext } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { AuthContext } from "../context/AuthContext";
import { getProfile, updateProfile } from "../services/api";
import "./ProfilePage.css";

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    role: "",
    createdAt: "",
    profilePictureUrl: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    profilePicture: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfileData({
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        createdAt: new Date(data.createdAt).toLocaleDateString(),
        profilePictureUrl: data.profilePictureUrl,
      });
      setFormData({
        fullName: data.fullName,
        email: data.email,
        profilePicture: null,
      });
      setError(null);
    } catch (err) {
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccessMsg("");
      
      const submitData = new FormData();
      submitData.append("fullName", formData.fullName);
      submitData.append("email", formData.email);
      if (formData.profilePicture) {
        submitData.append("profilePicture", formData.profilePicture);
      }

      const updatedUser = await updateProfile(submitData);

      setProfileData((prev) => ({
        ...prev,
        fullName: updatedUser.user.fullName,
        email: updatedUser.user.email,
      }));
      setSuccessMsg("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: profileData.fullName,
      email: profileData.email,
      profilePicture: null,
    });
    setIsEditing(false);
    setError(null);
    setSuccessMsg("");
  };

  return (
    <DashboardLayout title="My Profile" activeItem="profile">
      <div className="profile-page-container">
        <div className="profile-card">
          <div className="profile-header">
            <div 
              className="profile-avatar"
              style={{
                backgroundImage: profileData.profilePictureUrl ? `url(http://localhost:5218${profileData.profilePictureUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {!profileData.profilePictureUrl && (
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              )}
            </div>
            <div className="profile-title">
              <h3>{profileData.fullName}</h3>
              <p className="profile-role">{profileData.role}</p>
              {isEditing && (
                <div className="profile-picture-upload mt-2">
                  <label htmlFor="profilePicture" className="upload-label" style={{ fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer', textDecoration: 'underline' }}>
                    Change Picture
                  </label>
                  <input
                    type="file"
                    id="profilePicture"
                    name="profilePicture"
                    onChange={handleInputChange}
                    style={{ display: 'none' }}
                    accept="image/*"
                  />
                  {formData.profilePicture && (
                    <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', color: '#10b981' }}>
                      {formData.profilePicture.name} selected
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {error && <div className="profile-alert error">{error}</div>}
          {successMsg && <div className="profile-alert success">{successMsg}</div>}

          {loading && !isEditing ? (
            <p className="profile-loading">Loading profile...</p>
          ) : (
            <form className="profile-body" onSubmit={handleSave}>
              <div className="profile-field">
                <label>Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="profile-input"
                    required
                  />
                ) : (
                  <p className="profile-value">{profileData.fullName}</p>
                )}
              </div>

              <div className="profile-field">
                <label>Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="profile-input"
                    required
                  />
                ) : (
                  <p className="profile-value">{profileData.email}</p>
                )}
              </div>

              <div className="profile-field">
                <label>Member Since</label>
                <p className="profile-value muted">{profileData.createdAt}</p>
              </div>

              <div className="profile-actions">
                {isEditing ? (
                  <>
                    <button type="button" className="btn-cancel" onClick={handleCancel} disabled={loading}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-save" disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <button type="button" className="btn-edit" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ProfilePage;
