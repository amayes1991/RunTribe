"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import Header from "../components/Header";
import { useState, useEffect } from "react";
import { getImageUrl } from "../utils/imageUtils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Groups() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    location: "",
    imageUrl: ""
  });
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    description: "",
    location: "",
    imageUrl: ""
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

  // Fetch groups from backend
  useEffect(() => {
    if (session?.user?.email) {
      console.log('Session loaded, fetching groups for:', session.user.email);
      fetchGroups();
    }
  }, [session]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const userEmail = session?.user?.email || '';
      
      if (!userEmail) {
        setError('User session not loaded');
        return;
      }
      const response = await fetch(`${apiUrl}/api/groups?userEmail=${encodeURIComponent(userEmail)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Transform backend data to match frontend structure
        const transformedGroups = data.map(group => ({
          id: group.id,
          name: group.name,
          description: group.description,
          location: group.location,
          imageUrl: group.imageUrl,
          members: group.memberCount,
          creator: group.owner?.name || 'Unknown',
          isJoined: group.isJoined,
          isOwner: group.isOwner,
          createdAt: group.createdAt
        }));
        setGroups(transformedGroups);
      } else {
        try {
          const errorData = await response.json();
          setError(errorData.message || `Failed to fetch groups (${response.status})`);
        } catch (jsonError) {
          setError(`Failed to fetch groups: ${response.statusText || response.status}`);
        }
      }
    } catch (err) {
      setError('Error fetching groups');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    
    const userEmail = session?.user?.email || '';
    if (!userEmail) {
      setError('User session not loaded');
      return;
    }
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      
      const response = await fetch(`${apiUrl}/api/groups?userEmail=${encodeURIComponent(userEmail)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      

      if (response.ok) {
        setShowCreateModal(false);
        setCreateForm({ name: "", description: "", location: "", imageUrl: "" });
        await fetchGroups(); // Refresh the groups list
      } else {
        try {
          const errorData = await response.json();
          setError(errorData.message || `Failed to create group (${response.status})`);
        } catch (jsonError) {
          // If response.json() fails, use the status text
          setError(`Failed to create group: ${response.statusText || response.status}`);
        }
      }
    } catch (err) {
      setError('Error creating group');
      console.error('Error:', err);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const response = await fetch(`${apiUrl}/api/groups/${groupId}/join?userEmail=${encodeURIComponent(session?.user?.email || '')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchGroups(); // Refresh the groups list
      } else {
        try {
          const errorData = await response.json();
          setError(errorData.message || `Failed to join group (${response.status})`);
        } catch (jsonError) {
          setError(`Failed to join group: ${response.statusText || response.status}`);
        }
      }
    } catch (err) {
      setError('Error joining group');
      console.error('Error:', err);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const response = await fetch(`${apiUrl}/api/groups/${groupId}/leave?userEmail=${encodeURIComponent(session?.user?.email || '')}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchGroups(); // Refresh the groups list
      } else {
        try {
          const errorData = await response.json();
          setError(errorData.message || `Failed to leave group (${response.status})`);
        } catch (jsonError) {
          setError(`Failed to leave group: ${response.statusText || response.status}`);
        }
      }
    } catch (err) {
      setError('Error leaving group');
      console.error('Error:', err);
    }
  };

  const handleEditGroup = async (e) => {
    e.preventDefault();
    
    console.log('Updating group with data:', editForm);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const response = await fetch(`${apiUrl}/api/groups/${editForm.id}?userEmail=${encodeURIComponent(session?.user?.email || '')}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          location: editForm.location,
          imageUrl: editForm.imageUrl
        }),
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditForm({ id: "", name: "", description: "", location: "" });
        fetchGroups(); // Refresh the groups list
      } else {
        try {
          const errorData = await response.json();
          setError(errorData.message || `Failed to update group (${response.status})`);
        } catch (jsonError) {
          setError(`Failed to update group: ${response.statusText || response.status}`);
        }
      }
    } catch (err) {
      setError('Error updating group');
      console.error('Error:', err);
    }
  };

  const handleDeleteGroup = (group) => {
    setGroupToDelete(group);
    setShowDeleteDialog(true);
  };

  const confirmDeleteGroup = async () => {
    if (!groupToDelete) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const response = await fetch(`${apiUrl}/api/groups/${groupToDelete.id}?userEmail=${encodeURIComponent(session?.user?.email || '')}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchGroups(); // Refresh the groups list
        setShowDeleteDialog(false);
        setGroupToDelete(null);
      } else {
        try {
          const errorData = await response.json();
          setError(errorData.message || `Failed to delete group (${response.status})`);
        } catch (jsonError) {
          setError(`Failed to delete group: ${response.statusText || response.status}`);
        }
      }
    } catch (err) {
      setError('Error deleting group');
      console.error('Error:', err);
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
      return null;
    }
  };

  const openEditModal = (group) => {
    setEditForm({
      id: group.id,
      name: group.name,
      description: group.description || "",
      location: group.location || "",
      imageUrl: group.imageUrl || ""
    });
    setShowEditModal(true);
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (group.location && group.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#1a1a1a]">
        <Header />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#66ff00]">Groups</h2>
            <p className="mt-2 text-gray-300">
              Discover, create, and join running groups in your community.
            </p>
          </div>

          {/* Search and Create Group */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-500 focus:ring-1 focus:ring-[#66ff00] focus:border-[#66ff00]"
                />
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-[#66ff00] hover:bg-[#52cc00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#66ff00] transition-colors"
            >
              Create Group
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-900/20 border border-red-800 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setError(null)}
                    className="inline-flex text-red-400 hover:text-red-300 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#66ff00] mx-auto"></div>
                <p className="mt-4 text-gray-300">Loading groups...</p>
              </div>
            </div>
          ) : (
            /* Groups Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-white">No groups found</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new group.'}
                  </p>
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <div key={group.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 hover:shadow-lg transition-all">
                    {/* Group Image */}
                    {group.imageUrl && (
                      <div className="mb-4">
                        <img 
                          src={getImageUrl(group.imageUrl)} 
                          alt={`${group.name} group image`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">{group.name}</h3>
                      {group.isOwner && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#66ff00]/20 text-[#66ff00] border border-[#66ff00]/30">
                          Owner
                        </span>
                      )}
                    </div>
                    
                    {group.description && (
                      <p className="text-sm text-gray-300 mb-4">{group.description}</p>
                    )}
                    
                    {group.location && (
                      <div className="flex items-center text-sm text-gray-400 mb-4">
                        <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {group.location}
                      </div>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-400">
                        <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        {group.members} Members
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-400">
                        <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Created by {group.creator}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {group.isOwner ? (
                        <>
                          <button 
                            onClick={() => openEditModal(group)}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 hover:border-gray-500 transition-colors"
                          >
                            <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <Link 
                            href={`/groups/${group.id}`}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-[#66ff00] hover:bg-[#52cc00] transition-colors"
                          >
                            View
                          </Link>
                          <button 
                            onClick={() => handleDeleteGroup(group)}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-red-700 text-sm font-medium rounded-md text-red-300 bg-red-900/20 hover:bg-red-900/30 hover:border-red-600 transition-colors"
                          >
                            <svg className="h-4 w-4 mr-1 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </>
                      ) : group.isJoined ? (
                        <>
                          <button 
                            onClick={() => handleLeaveGroup(group.id)}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 hover:border-gray-500 transition-colors"
                          >
                            <svg className="h-4 w-4 mr-1 text-[#66ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Joined
                          </button>
                          <Link 
                            href={`/groups/${group.id}`}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-[#66ff00] hover:bg-[#52cc00] transition-colors"
                          >
                            View
                          </Link>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleJoinGroup(group.id)}
                          className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-purple-500 hover:bg-purple-600 transition-colors"
                        >
                          Join Group
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Edit Group Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-gray-900 border-gray-800">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Edit Group</h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditForm({ id: "", name: "", description: "", location: "", imageUrl: "" });
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleEditGroup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="editGroupName" className="block text-sm font-medium text-gray-300">Group Name</Label>
                    <Input
                      id="editGroupName"
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Enter group name"
                      className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="editLocation" className="block text-sm font-medium text-gray-300">Location</Label>
                    <Input
                      id="editLocation"
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="Enter location (e.g., City, State)"
                      className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="editDescription" className="block text-sm font-medium text-gray-300">Description</Label>
                    <Textarea
                      id="editDescription"
                      rows={3}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Describe your group"
                      className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="editGroupImage" className="block text-sm font-medium text-gray-300">Group Image</Label>
                    <Input
                      id="editGroupImage"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          console.log('Uploading image:', file.name);
                          const imageUrl = await handleImageUpload(file);
                          if (imageUrl) {
                            console.log('Image uploaded successfully:', imageUrl);
                            setEditForm({ ...editForm, imageUrl });
                          } else {
                            console.log('Image upload failed');
                          }
                        }
                      }}
                      className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                    />
                    {editForm.imageUrl && (
                      <div className="mt-2">
                        <img 
                          src={getImageUrl(editForm.imageUrl)} 
                          alt="Group preview" 
                          className="w-20 h-20 object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditForm({ id: "", name: "", description: "", location: "", imageUrl: "" });
                      }}
                      className="px-4 py-2 border border-gray-700 bg-gray-800 text-gray-300 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#66ff00] text-black rounded-md text-sm font-medium hover:bg-[#52cc00] transition-colors"
                    >
                      Update Group
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-gray-900 border-gray-800">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Create New Group</h3>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateForm({ name: "", description: "", location: "", imageUrl: "" });
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupName" className="block text-sm font-medium text-gray-300">Group Name</Label>
                    <Input
                      id="groupName"
                      type="text"
                      required
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="Enter group name"
                      className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location" className="block text-sm font-medium text-gray-300">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      value={createForm.location}
                      onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                      placeholder="Enter location (e.g., City, State)"
                      className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</Label>
                    <Textarea
                      id="description"
                      rows={3}
                      value={createForm.description}
                      onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      placeholder="Describe your group"
                      className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="groupImage" className="block text-sm font-medium text-gray-300">Group Image</Label>
                    <Input
                      id="groupImage"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const imageUrl = await handleImageUpload(file);
                          if (imageUrl) {
                            setCreateForm({ ...createForm, imageUrl });
                          }
                        }
                      }}
                      className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                    />
                    {createForm.imageUrl && (
                      <div className="mt-2">
                        <img 
                          src={getImageUrl(createForm.imageUrl)} 
                          alt="Group preview" 
                          className="w-20 h-20 object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setCreateForm({ name: "", description: "", location: "", imageUrl: "" });
                      }}
                      className="px-4 py-2 border border-gray-700 bg-gray-800 text-gray-300 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#66ff00] text-black rounded-md text-sm font-medium hover:bg-[#52cc00] transition-colors"
                    >
                      Create Group
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Group Confirmation Modal */}
        {showDeleteDialog && groupToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-gray-900 border-gray-800">
              <div className="mt-3 text-center">
                <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-white">Delete Group</h3>
                <p className="mt-1 text-sm text-gray-400">
                  This action cannot be undone. This will permanently delete the group
                  <span className="font-medium text-white"> "{groupToDelete.name}"</span>.
                </p>
                
                <div className="mt-6 flex justify-center space-x-3">
                  <button
                    onClick={() => setShowDeleteDialog(false)}
                    className="px-4 py-2 border border-gray-700 bg-gray-800 text-gray-300 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteGroup}
                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Delete Group
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
