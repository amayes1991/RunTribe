"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import Header from "../components/Header";
import { useState, useEffect } from "react";
import { getImageUrl } from "../utils/imageUtils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Profile() {
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Edit Profile State
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    imageUrl: ""
  });

  // Password Change State
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Debug: Log when userStats changes
  useEffect(() => {
    console.log('userStats changed:', userStats);
  }, [userStats]);

  // Fetch user data
  useEffect(() => {
    if (session?.user?.email) {
      // Add a small delay to ensure session is fully loaded
      const timer = setTimeout(() => {
        fetchUserData();
        fetchUserStats();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const response = await fetch(`${apiUrl}/api/users/profile?userEmail=${encodeURIComponent(session.user.email)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setEditForm({
          name: userData.name || "",
          email: userData.email || "",
          imageUrl: userData.imageUrl || ""
        });
      } else {
        setError('Failed to fetch user data');
      }
    } catch (err) {
      setError('Error fetching user data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      console.log('Fetching user stats from:', apiUrl);
      console.log('User email:', session.user.email);
      
      const response = await fetch(`${apiUrl}/api/users/stats?userEmail=${encodeURIComponent(session.user.email)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Stats response status:', response.status);
      console.log('Stats response ok:', response.ok);

      if (response.ok) {
        const statsData = await response.json();
        console.log('Stats data received:', statsData);
        setUserStats(statsData);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch user stats:', response.status, errorText);
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const response = await fetch(`${apiUrl}/api/imageupload/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to upload image');
        return null;
      }
    } catch (err) {
      setError('Error uploading image');
      console.error('Error:', err);
    }
  };

  console.log('userStats', userStats);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    // Validate password strength
    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    // Additional password strength validation
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setError('New password must be different from current password');
      return;
    }

    try {
      setPasswordLoading(true);
      setError("");
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const requestBody = {
        userEmail: session.user.email,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      };
      
      console.log('🔐 Attempting password change...');
      console.log('📡 API URL:', `${apiUrl}/api/users/change-password`);
      console.log('📤 Request body:', requestBody);
      
      const response = await fetch(`${apiUrl}/api/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        setSuccess('Password changed successfully!');
        setShowChangePassword(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setSuccess(null), 3000);
      } else {
        // Handle different response types
        let errorMessage = 'Failed to change password';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If JSON parsing fails, try to get text response
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = errorText;
            }
          } catch (textError) {
            // If both fail, use status-based message
            switch (response.status) {
              case 400:
                errorMessage = 'Bad request - please check your input';
                break;
              case 401:
                errorMessage = 'Unauthorized - please log in again';
                break;
              case 404:
                errorMessage = 'API endpoint not found - please check if backend is running';
                break;
              case 500:
                errorMessage = 'Server error - please try again later';
                break;
              default:
                errorMessage = `Request failed with status ${response.status}`;
                break;
            }
          }
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      setError('Error changing password');
      console.error('Error:', err);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const response = await fetch(`${apiUrl}/api/users/profile?userEmail=${encodeURIComponent(session.user.email)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        setShowEditProfile(false);
        fetchUserData(); // Refresh user data
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Error updating profile');
      console.error('Error:', err);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#66ff00] mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading profile...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#1a1a1a]">
        <Header />

        {/* Profile Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#66ff00]">Profile</h2>
            <p className="mt-2 text-gray-300">
              Manage your account settings and preferences.
            </p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 bg-green-900/20 border border-green-800 rounded-md p-4">
              <p className="text-green-300">{success}</p>
            </div>
          )}
          
          {error && (
            <div className="mb-6 bg-red-900/20 border border-red-800 rounded-md p-4">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center space-x-6 mb-6">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    {user?.imageUrl ? (
                      <img 
                        src={getImageUrl(user.imageUrl)} 
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-700"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white">{user?.name || 'No name set'}</h3>
                    <p className="text-gray-300">{user?.email}</p>
                    <p className="text-sm text-gray-400">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Email</label>
                    <p className="mt-1 text-sm text-white">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Name</label>
                    <p className="mt-1 text-sm text-white">{user?.name || "Not set"}</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-800">
                  <div className="space-y-3">
                    <button 
                      onClick={() => setShowEditProfile(true)}
                      className="w-full text-left px-4 py-3 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:border-gray-600 transition-colors"
                    >
                      Edit Profile
                    </button>
                    <button 
                      onClick={() => setShowChangePassword(true)}
                      className="w-full text-left px-4 py-3 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:border-gray-600 transition-colors"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Account Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Groups Joined</span>
                    <span className="text-sm font-medium text-white">
                      {userStats ? userStats.groupsJoined : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Groups Owned</span>
                    <span className="text-sm font-medium text-white">
                      {userStats ? userStats.groupsOwned : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Total Runs</span>
                    <span className="text-sm font-medium text-white">
                      {userStats ? userStats.totalRuns : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-gray-900 border-gray-800">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Edit Profile</h3>
                  <button
                    onClick={() => setShowEditProfile(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleEditProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="editName" className="block text-sm font-medium text-gray-300">Name</Label>
                    <Input
                      id="editName"
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Enter your name"
                      className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="editEmail" className="block text-sm font-medium text-gray-300">Email</Label>
                    <Input
                      id="editEmail"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="Enter your email"
                      className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="editProfileImage" className="block text-sm font-medium text-gray-300">Profile Image</Label>
                    <Input
                      id="editProfileImage"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const imageUrl = await handleImageUpload(file);
                          if (imageUrl) {
                            setEditForm({ ...editForm, imageUrl });
                          }
                        }
                      }}
                      className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                    />
                    {editForm.imageUrl && (
                      <div className="mt-2">
                        <img 
                          src={getImageUrl(editForm.imageUrl)} 
                          alt="Profile preview" 
                          className="w-20 h-20 object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditProfile(false)}
                      className="px-4 py-2 border border-gray-700 bg-gray-800 text-gray-300 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#66ff00] text-black rounded-md text-sm font-medium hover:bg-[#52cc00] transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showChangePassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-gray-900 border-gray-800">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Change Password</h3>
                  <button
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                      setError(""); // Clear any previous errors
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {/* Show error messages in the modal */}
                  {error && (
                    <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded-md">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter your current password"
                      className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="block text-sm font-medium text-gray-300">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter your new password"
                      className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400">Password must be at least 6 characters long</p>
                    {passwordForm.newPassword && (
                      <div className="mt-2">
                        <div className="flex space-x-1">
                          <div className={`h-2 flex-1 rounded ${
                            passwordForm.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-600'
                          }`}></div>
                          <div className={`h-2 flex-1 rounded ${
                            passwordForm.newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-600'
                          }`}></div>
                          <div className={`h-2 flex-1 rounded ${
                            /[A-Z]/.test(passwordForm.newPassword) ? 'bg-green-500' : 'bg-gray-600'
                          }`}></div>
                          <div className={`h-2 flex-1 rounded ${
                            /[0-9]/.test(passwordForm.newPassword) ? 'bg-green-500' : 'bg-gray-600'
                          }`}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>6+ chars</span>
                          <span>8+ chars</span>
                          <span>Uppercase</span>
                          <span>Number</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Confirm your new password"
                      className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowChangePassword(false);
                        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                        setError(""); // Clear any previous errors
                      }}
                      className="px-4 py-2 border border-gray-700 bg-gray-800 text-gray-300 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="px-4 py-2 bg-[#66ff00] text-black rounded-md text-sm font-medium hover:bg-[#52cc00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {passwordLoading ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Changing...
                        </div>
                      ) : (
                        'Change Password'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

