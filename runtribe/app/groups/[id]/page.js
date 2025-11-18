'use client';

import { useSession, signOut } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Header from '../../components/Header';
import Link from 'next/link';
import { getImageUrl } from '../../utils/imageUtils';
import signalRService from '../../services/signalRService';
import GoogleMapComponent from '../../components/GoogleMap';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function GroupDetails() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const groupId = params.id;
  
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [groupRuns, setGroupRuns] = useState([]);
  const [groupRunsLoading, setGroupRunsLoading] = useState(false);
  const [showScheduleRun, setShowScheduleRun] = useState(false);
  const [newRunTitle, setNewRunTitle] = useState('');
  const [newRunContent, setNewRunContent] = useState('');
  const [newRunDateTime, setNewRunDateTime] = useState('');
  const [newRunLocation, setNewRunLocation] = useState('');
  const [newRunPace, setNewRunPace] = useState('');
  const [newRunDistance, setNewRunDistance] = useState('');
  const [editingRun, setEditingRun] = useState(null);
  const [editRunTitle, setEditRunTitle] = useState('');
  const [editRunContent, setEditRunContent] = useState('');
  const [editRunDateTime, setEditRunDateTime] = useState('');
  const [editRunLocation, setEditRunLocation] = useState('');
  const [editRunPace, setEditRunPace] = useState('');
  const [editRunDistance, setEditRunDistance] = useState('');
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [comments, setComments] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [runToDelete, setRunToDelete] = useState(null);
  const [showEditRun, setShowEditRun] = useState(false);

  // Fetch group details and group runs
  useEffect(() => {
    if (session?.user?.email && groupId) {
      fetchGroupDetails();
      fetchGroupRuns();
    }
  }, [session, groupId]);

  // Fetch messages when chat is shown
  useEffect(() => {
    if (showChat && session?.user?.email && groupId) {
      fetchMessages();
      setupSignalR();
    }
  }, [showChat, session, groupId]);

  // Cleanup SignalR when component unmounts or chat is hidden
  useEffect(() => {
    return () => {
      if (groupId) {
        signalRService.leaveGroup(groupId);
      }
    };
  }, [groupId]);

  const setupSignalR = async () => {
    try {
      await signalRService.connect();
      await signalRService.joinGroup(groupId);

      // Set up message handlers
      signalRService.onMessage((message) => {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          if (prev.some(m => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      });

      signalRService.onTyping((userEmail, isTyping) => {
        if (userEmail !== session?.user?.email) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            if (isTyping) {
              newSet.add(userEmail);
            } else {
              newSet.delete(userEmail);
            }
            return newSet;
          });
        }
      });

      signalRService.onMessageDeleted((messageId) => {
        setMessages(prev => prev.filter(m => m.id !== messageId));
      });
    } catch (error) {
      console.error('Error setting up SignalR:', error);
    }
  };

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const response = await fetch(`${apiUrl}/api/groups/${groupId}?userEmail=${encodeURIComponent(session.user.email)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroup(data);
        setIsJoined(data.isJoined || false);
        setIsOwner(data.isOwner || false);
      } else {
        setError('Failed to fetch group details');
      }
    } catch (err) {
      setError('Error fetching group details');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const response = await fetch(`${apiUrl}/api/groups/${groupId}/join?userEmail=${encodeURIComponent(session.user.email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsJoined(true);
        fetchGroupDetails(); // Refresh data
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to join group');
      }
    } catch (err) {
      setError('Error joining group');
      console.error('Error:', err);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const response = await fetch(`${apiUrl}/api/groups/${groupId}/leave?userEmail=${encodeURIComponent(session.user.email)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsJoined(false);
        fetchGroupDetails(); // Refresh data
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to leave group');
      }
    } catch (err) {
      setError('Error leaving group');
      console.error('Error:', err);
    }
  };

  // Group Runs functionality
  const fetchGroupRuns = async () => {
    try {
      setGroupRunsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const response = await fetch(`${apiUrl}/api/groupruns/group/${groupId}?userEmail=${encodeURIComponent(session.user.email)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroupRuns(data || []); // Ensure we always have an array
      } else if (response.status === 404) {
        // Group not found - set empty group runs array
        setGroupRuns([]);
        console.log('Group not found or no runs available');
      } else {
        // Other error - set empty group runs array and log error
        setGroupRuns([]);
        console.error('Failed to fetch group runs:', response.status, response.statusText);
      }
    } catch (err) {
      // Network or other error - set empty group runs array
      setGroupRuns([]);
      console.error('Error fetching group runs:', err);
    } finally {
      setGroupRunsLoading(false);
    }
  };

  // Silent refresh for attendance updates (no loading state)
  const refreshGroupRunsSilently = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const response = await fetch(`${apiUrl}/api/groupruns/group/${groupId}?userEmail=${encodeURIComponent(session.user.email)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroupRuns(data || []); // Update data without showing loading
      }
    } catch (err) {
      // Silently handle errors for attendance updates
      console.error('Silent refresh error:', err);
    }
  };

  const handleCreateRun = async (e) => {
    e.preventDefault();
    if (!newRunTitle.trim()) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const response = await fetch(`${apiUrl}/api/groupruns?userEmail=${encodeURIComponent(session.user.email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newRunTitle,
          content: newRunContent,
          groupId: groupId,
          runDateTime: newRunDateTime || null,
          runLocation: newRunLocation || null,
          pace: newRunPace || null,
          distance: newRunDistance || null
        }),
      });

      if (response.ok) {
        setNewRunTitle('');
        setNewRunContent('');
        setNewRunDateTime('');
        setNewRunLocation('');
        setNewRunPace('');
        setNewRunDistance('');
        setShowScheduleRun(false);
        fetchGroupRuns(); // Refresh group runs to update upcoming runs display
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to schedule run');
      }
    } catch (err) {
      setError('Error scheduling run');
      console.error('Error:', err);
    }
  };

  const handleEditRun = async (e) => {
    e.preventDefault();
    if (!editRunTitle.trim() || !editingRun) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const response = await fetch(`${apiUrl}/api/groupruns/${editingRun.id}?userEmail=${encodeURIComponent(session.user.email)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editRunTitle,
          content: editRunContent,
          runDateTime: editRunDateTime || null,
          runLocation: editRunLocation || null,
          pace: editRunPace || null,
          distance: editRunDistance || null
        }),
      });

      if (response.ok) {
        setEditingRun(null);
        setEditRunTitle('');
        setEditRunContent('');
        setEditRunDateTime('');
        setEditRunLocation('');
        setEditRunPace('');
        setEditRunDistance('');
        setShowEditRun(false);
        fetchGroupRuns(); // Refresh group runs
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update run');
      }
    } catch (err) {
      setError('Error updating run');
      console.error('Error:', err);
    }
  };

  const handleDeleteRun = (run) => {
    setRunToDelete(run);
    setShowDeleteDialog(true);
  };

  const confirmDeleteRun = async () => {
    if (!runToDelete) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const response = await fetch(`${apiUrl}/api/groupruns/${runToDelete.id}?userEmail=${encodeURIComponent(session.user.email)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchGroupRuns(); // Refresh group runs
        setShowDeleteDialog(false);
        setRunToDelete(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete run');
      }
    } catch (err) {
      setError('Error deleting run');
      console.error('Error:', err);
    }
  };

  // Comments functionality
  const fetchComments = async (runId) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const response = await fetch(`${apiUrl}/api/comments/run/${runId}?userEmail=${encodeURIComponent(session.user.email)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => ({ ...prev, [runId]: data }));
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleCreateComment = async (runId) => {
    const commentContent = newComment[runId];
    if (!commentContent?.trim()) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const response = await fetch(`${apiUrl}/api/comments?userEmail=${encodeURIComponent(session.user.email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: commentContent,
          runId: runId
        }),
      });

      if (response.ok) {
        setNewComment(prev => ({ ...prev, [runId]: '' }));
        fetchComments(runId); // Refresh comments
        fetchGroupRuns(); // Refresh group runs to update comment count
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create comment');
      }
    } catch (err) {
      setError('Error creating comment');
      console.error('Error:', err);
    }
  };

  const handleDeleteComment = async (commentId, runId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const response = await fetch(`${apiUrl}/api/comments/${commentId}?userEmail=${encodeURIComponent(session.user.email)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchComments(runId); // Refresh comments
        fetchGroupRuns(); // Refresh group runs to update comment count
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete comment');
      }
    } catch (err) {
      setError('Error deleting comment');
      console.error('Error:', err);
    }
  };

  // Chat functionality
  const fetchMessages = async () => {
    try {
      setMessagesLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const response = await fetch(`${apiUrl}/api/messages/group/${groupId}?userEmail=${encodeURIComponent(session.user.email)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch messages');
      }
    } catch (err) {
      setError('Error fetching messages');
      console.error('Error:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const response = await fetch(`${apiUrl}/api/messages/group/${groupId}?userEmail=${encodeURIComponent(session.user.email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage.trim()
        }),
      });

      if (response.ok) {
        setNewMessage('');
        // Message will be received via SignalR, no need to manually refresh
        // Stop typing indicator
        setIsTyping(false);
        await signalRService.userStoppedTyping(groupId, session.user.email);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to send message');
      }
    } catch (err) {
      setError('Error sending message');
      console.error('Error:', err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const response = await fetch(`${apiUrl}/api/messages/${messageId}?userEmail=${encodeURIComponent(session.user.email)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchMessages(); // Refresh messages
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete message');
      }
    } catch (err) {
      setError('Error deleting message');
      console.error('Error:', err);
    }
  };

  // Attendance functionality
  const handleAttendanceChange = async (runId, status) => {
    try {
      setAttendanceLoading(prev => ({ ...prev, [runId]: true }));
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const response = await fetch(`${apiUrl}/api/runattendance?userEmail=${encodeURIComponent(session.user.email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupRunId: runId,
          status: status
        }),
      });

      if (response.ok) {
        // Update userAttendance locally for immediate feedback (no flickering)
        setGroupRuns(prevRuns => 
          prevRuns.map(run => {
            if (run.id === runId) {
              return {
                ...run,
                userAttendance: { status, notes: null }
              };
            }
            return run;
          })
        );
        
        // Also update the group state if this affects the next upcoming run
        setGroup(prevGroup => {
          if (prevGroup?.nextUpcomingRun?.id === runId) {
            return {
              ...prevGroup,
              nextUpcomingRun: {
                ...prevGroup.nextUpcomingRun,
                userAttendance: { status, notes: null }
              }
            };
          }
          return prevGroup;
        });
        
        // Refetch attendance data in the background to get accurate counts
        // This prevents flickering but ensures data accuracy
        setTimeout(() => {
          refreshGroupRunsSilently();
        }, 100);
      } else {
        // Handle error response more safely
        let errorMessage = 'Failed to update attendance';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }
        setError(errorMessage);
      }
    } catch (err) {
      setError('Error updating attendance');
      console.error('Error:', err);
    } finally {
      setAttendanceLoading(prev => ({ ...prev, [runId]: false }));
    }
  };

  const getAttendanceButtonClass = (currentStatus, buttonStatus) => {
    if (currentStatus === buttonStatus) {
      switch (buttonStatus) {
        case 'Going':
          return 'bg-green-600 text-white border-green-600';
        case 'Maybe':
          return 'bg-yellow-600 text-white border-yellow-600';
        case 'NotGoing':
          return 'bg-red-600 text-white border-red-600';
        default:
          return 'bg-gray-600 text-white border-gray-600';
      }
    } else {
      return 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700';
    }
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#66ff00] mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading group details...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Access control: Only allow group owners and members to view group details
  if (group && !isOwner && !isJoined) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-gray-900 rounded-lg shadow-lg p-8 border border-gray-800">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-900/20 rounded-full flex items-center justify-center border border-red-800">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Access Restricted</h2>
              <p className="text-gray-300 mb-6">
                You need to join this group to view its details and upcoming runs.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleJoinGroup}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-[#66ff00] hover:bg-[#52cc00]"
                >
                  Join Group
                </button>
                <button 
                  onClick={() => router.push('/groups')}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700"
                >
                  Back to Groups
                </button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

              if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-900/20 border border-red-800 rounded-md p-4">
              <p className="text-red-400">{error}</p>
              <button 
                onClick={() => router.back()}
                className="mt-2 text-[#66ff00] hover:text-[#52cc00]"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!group) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-300">Group not found</p>
            <button 
              onClick={() => router.back()}
              className="mt-2 text-[#66ff00] hover:text-[#52cc00]"
            >
              Go Back
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#1a1a1a]">
        <Header />

        {/* Group Header */}
        <div className="bg-gray-900 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center space-x-6">
              {/* Group Image */}
              <div className="flex-shrink-0">
                {group.imageUrl ? (
                  <img 
                    src={getImageUrl(group.imageUrl)} 
                    alt={`${group.name} group image`}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                    <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Group Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-[#66ff00]">{group.name}</h1>
                {group.location && (
                  <p className="text-lg text-gray-300 mt-1">{group.location}</p>
                )}
                <p className="text-gray-400 mt-1">
                  Created by {group.owner?.name || 'Unknown'} | {group.members?.length || 0} Members
                </p>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                {isOwner ? (
                  <span className="inline-flex items-center px-4 py-2 border border-[#66ff00]/30 text-sm font-medium rounded-md text-[#66ff00] bg-[#66ff00]/20">
                    Group Owner
                  </span>
                ) : isJoined ? (
                  <button
                    onClick={handleLeaveGroup}
                    className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700"
                  >
                    Leave Group
                  </button>
                ) : (
                  <button
                    onClick={handleJoinGroup}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-[#66ff00] hover:bg-[#52cc00]"
                  >
                    Join Group
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-[#1a1a1a]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {group.description && (
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                  <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
                  <p className="text-gray-300">{group.description}</p>
                </div>
              )}

              {/* Next Upcoming Run */}
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-white mb-3">Next Upcoming Run</h2>
                {(() => {
                  // Find the next upcoming run from group runs
                  const now = new Date();
                  const upcomingRuns = groupRuns
                    .filter(run => run.runDateTime && new Date(run.runDateTime) > now)
                    .sort((a, b) => new Date(a.runDateTime) - new Date(b.runDateTime));
                  
                  const nextRun = upcomingRuns[0];
                  
                  if (!nextRun) {
                    return (
                      <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-white">No upcoming runs scheduled</h3>
                        {/* <p className="mt-1 text-sm text-gray-500">Group owners can schedule runs by creating posts with run details.</p> */}
                      </div>
                    );
                  }
                  
                  const runDate = new Date(nextRun.runDateTime);
                  const isToday = runDate.toDateString() === now.toDateString();
                  const isTomorrow = runDate.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
                  
                  let dateText = '';
                  if (isToday) {
                    dateText = 'Today';
                  } else if (isTomorrow) {
                    dateText = 'Tomorrow';
                  } else {
                    dateText = runDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    });
                  }
                  
                  const timeText = runDate.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  });
                  
                  return (
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#66ff00]/20 text-[#66ff00] border border-[#66ff00]/30">
                              {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : 'Upcoming'}
                            </span>
                            {isToday && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/20 text-green-400 border border-green-800">
                                Next Run
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-xl font-bold text-white mb-2">
                            {nextRun.content.length > 60 
                              ? nextRun.content.substring(0, 60) + '...' 
                              : nextRun.content
                            }
                          </h3>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-300">
                              <svg className="w-4 h-4 mr-2 text-[#66ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="font-medium">{dateText}</span>
                              <span className="mx-2">•</span>
                              <span>{timeText}</span>
                            </div>
                            
                            {nextRun.runLocation && (
                              <div className="flex items-center text-sm text-gray-300">
                                <svg className="w-4 h-4 mr-2 text-[#66ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{nextRun.runLocation}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center text-sm text-gray-400">
                              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span>Posted by {nextRun.author?.name || nextRun.author?.email}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0 ml-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#66ff00]">
                              {runDate.getDate()}
                            </div>
                            <div className="text-sm text-gray-400 uppercase">
                              {runDate.toLocaleDateString('en-US', { month: 'short' })}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Attendance Section */}
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-white mb-2">Who's Going?</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-300">
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>{nextRun.attendanceSummary?.going || 0} Going</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <span>{nextRun.attendanceSummary?.maybe || 0} Maybe</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span>{nextRun.attendanceSummary?.notGoing || 0} Not Going</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Attendance Buttons */}
                        <div className="flex space-x-2 mb-3">
                          <button
                            onClick={() => handleAttendanceChange(nextRun.id, 'Going')}
                            disabled={attendanceLoading[nextRun.id]}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${getAttendanceButtonClass(nextRun.userAttendance?.status, 'Going')} disabled:opacity-50`}
                          >
                            {attendanceLoading[nextRun.id] ? '...' : 'Going'}
                          </button>
                          <button
                            onClick={() => handleAttendanceChange(nextRun.id, 'Maybe')}
                            disabled={attendanceLoading[nextRun.id]}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${getAttendanceButtonClass(nextRun.userAttendance?.status, 'Maybe')} disabled:opacity-50`}
                          >
                            {attendanceLoading[nextRun.id] ? '...' : 'Maybe'}
                          </button>
                          <button
                            onClick={() => handleAttendanceChange(nextRun.id, 'NotGoing')}
                            disabled={attendanceLoading[nextRun.id]}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${getAttendanceButtonClass(nextRun.userAttendance?.status, 'NotGoing')} disabled:opacity-50`}
                          >
                            {attendanceLoading[nextRun.id] ? '...' : 'Not Going'}
                          </button>
                        </div>
                        
                        {/* Current Status */}
                        {nextRun.userAttendance?.status && (
                          <div className="text-sm text-[#66ff00]">
                            You marked yourself as: <span className="font-medium capitalize">{nextRun.userAttendance.status}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-400">
                            <span className="font-medium">{upcomingRuns.length}</span> upcoming run{upcomingRuns.length !== 1 ? 's' : ''} scheduled
                          </div>
                          
                          {isOwner && (
                            <button
                              onClick={() => setShowScheduleRun(true)}
                              className="inline-flex items-center px-3 py-1.5 border border-[#66ff00]/30 text-sm font-medium rounded-md text-[#66ff00] bg-[#66ff00]/20 hover:bg-[#66ff00]/30"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Schedule Another Run
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Scheduled Runs */}
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-white">Scheduled Runs</h2>
                  {isOwner && (
                    <button
                      onClick={() => setShowScheduleRun(true)}
                      className="px-4 py-2 bg-[#66ff00] text-black text-sm font-medium rounded-md hover:bg-[#66ff00]/80"
                    >
                      Schedule Run
                    </button>
                  )}
                </div>

                {/* Schedule Run Modal */}
                {showScheduleRun && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-gray-900 border-gray-800">
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-white">Schedule New Run</h3>
                          <button
                            onClick={() => setShowScheduleRun(false)}
                            className="text-gray-400 hover:text-white"
                          >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        <form onSubmit={handleCreateRun} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="runTitle" className="block text-sm font-medium text-gray-300">Run Title *</Label>
                            <Input
                              id="runTitle"
                              type="text"
                              required
                              value={newRunTitle}
                              onChange={(e) => setNewRunTitle(e.target.value)}
                              placeholder="e.g., Morning 5K, Trail Run, etc."
                              className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="runContent" className="block text-sm font-medium text-gray-300">Run Description (Optional)</Label>
                            <Textarea
                              id="runContent"
                              rows={3}
                              value={newRunContent}
                              onChange={(e) => setNewRunContent(e.target.value)}
                              placeholder="Describe the run, route, or any special instructions..."
                              className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="runDateTime" className="block text-sm font-medium text-gray-300">Run Date & Time *</Label>
                              <Input
                                id="runDateTime"
                                type="datetime-local"
                                required
                                value={newRunDateTime}
                                onChange={(e) => setNewRunDateTime(e.target.value)}
                                className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="runLocation" className="block text-sm font-medium text-gray-300">Run Location *</Label>
                              <Input
                                id="runLocation"
                                type="text"
                                required
                                value={newRunLocation}
                                onChange={(e) => setNewRunLocation(e.target.value)}
                                placeholder="e.g., Central Park, NYC"
                                className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="runPace" className="block text-sm font-medium text-gray-300">Expected Pace (Optional)</Label>
                              <Input
                                id="runPace"
                                type="text"
                                value={newRunPace}
                                onChange={(e) => setNewRunPace(e.target.value)}
                                placeholder="e.g., 8:00/mile, Easy pace"
                                className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="runDistance" className="block text-sm font-medium text-gray-300">Run Distance (Optional)</Label>
                              <Input
                                id="runDistance"
                                type="text"
                                value={newRunDistance}
                                onChange={(e) => setNewRunDistance(e.target.value)}
                                placeholder="e.g., 5K, 10 miles, etc."
                                className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end space-x-3 pt-4">
                            <button
                              type="button"
                              onClick={() => setShowScheduleRun(false)}
                              className="px-4 py-2 border border-gray-700 bg-gray-800 text-gray-300 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-[#66ff00] text-black rounded-md text-sm font-medium hover:bg-[#52cc00] transition-colors"
                            >
                              Schedule Run
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {/* Group Runs List */}
                {groupRunsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#66ff00] mx-auto"></div>
                    <p className="mt-2 text-gray-400">Loading scheduled runs...</p>
                  </div>
                ) : groupRuns.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-white">No runs scheduled yet</h3>
                    <p className="mt-1 text-sm text-gray-400">Group owners can schedule runs for the group!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupRuns.map((run) => (
                      <div key={run.id} className="border border-gray-700 rounded-lg p-4 bg-gray-900">

                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-[#66ff00]/20 rounded-full flex items-center justify-center border border-[#66ff00]/30">
                                  <span className="text-[#66ff00] text-sm font-medium">
                                    {run.author?.name?.charAt(0) || run.author?.email?.charAt(0) || 'U'}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white">
                                    {run.author?.name || run.author?.email}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {new Date(run.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              {run.isOwner && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => {
                                      setEditingRun(run);
                                      setEditRunTitle(run.title);
                                      setEditRunContent(run.content || '');
                                      setEditRunDateTime(run.runDateTime ? new Date(run.runDateTime).toISOString().slice(0, 16) : '');
                                      setEditRunLocation(run.runLocation || '');
                                      setEditRunPace(run.pace || '');
                                      setEditRunDistance(run.distance || '');
                                      setShowEditRun(true);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRun(run)}
                                    className="text-red-400 hover:text-red-600"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">{run.title}</h3>
                            {run.content && <p className="text-gray-300 mb-3">{run.content}</p>}
                            
                            {/* Run Information */}
                            {(run.runDateTime || run.runLocation || run.pace || run.distance) && (
                              <div className="mt-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                                <h4 className="text-sm font-medium text-white mb-2">Run Details</h4>
                                {run.runDateTime && (
                                  <div className="flex items-center text-sm text-gray-300 mb-1">
                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {new Date(run.runDateTime).toLocaleString()}
                                  </div>
                                )}
                                {run.runLocation && (
                                  <div className="flex items-center text-sm text-gray-300 mb-1">
                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {run.runLocation}
                                  </div>
                                )}
                                {run.pace && (
                                  <div className="flex items-center text-sm text-gray-300 mb-1">
                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    {run.pace}
                                  </div>
                                )}
                                {run.distance && (
                                  <div className="flex items-center text-sm text-gray-300">
                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10V4m-6 3l6-3" />
                                    </svg>
                                    {run.distance}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Attendance Section */}
                            <div className="mt-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                              <h4 className="text-sm font-medium text-white mb-2">Who's Going?</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-300 mb-3">
                                <div className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span>{run.attendanceSummary?.going || 0} Going</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                  <span>{run.attendanceSummary?.maybe || 0} Maybe</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  <span>{run.attendanceSummary?.notGoing || 0} Not Going</span>
                                </div>
                              </div>
                              
                              {/* Attendance Buttons */}
                              <div className="flex space-x-2 mb-2">
                                <button
                                  onClick={() => handleAttendanceChange(run.id, 'Going')}
                                  disabled={attendanceLoading[run.id]}
                                  className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${getAttendanceButtonClass(run.userAttendance?.status, 'Going')} disabled:opacity-50`}
                                >
                                  {attendanceLoading[run.id] ? '...' : 'Going'}
                                </button>
                                <button
                                  onClick={() => handleAttendanceChange(run.id, 'Maybe')}
                                  disabled={attendanceLoading[run.id]}
                                  className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${getAttendanceButtonClass(run.userAttendance?.status, 'Maybe')} disabled:opacity-50`}
                                >
                                  {attendanceLoading[run.id] ? '...' : 'Maybe'}
                                </button>
                                <button
                                  onClick={() => handleAttendanceChange(run.id, 'NotGoing')}
                                  disabled={attendanceLoading[run.id]}
                                  className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${getAttendanceButtonClass(run.userAttendance?.status, 'NotGoing')} disabled:opacity-50`}
                                >
                                  {attendanceLoading[run.id] ? '...' : 'Not Going'}
                                </button>
                              </div>
                              
                              {/* Current Status */}
                              {run.userAttendance?.status && (
                                <div className="text-sm text-[#66ff00]">
                                  You marked yourself as: <span className="font-medium capitalize">{run.userAttendance.status}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Google Map for Run Location */}
                            {/* {run.runLocation && (
                              <div className="mt-3">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Run Location</h4>
                                <GoogleMapComponent 
                                  location={run.runLocation} 
                                  height="250px" 
                                  width="100%" 
                                />
                              </div>
                            )} */}
                            
                            {/* Comments Section */}
                            <div className="mt-4">
                              <div className="flex items-center justify-between mb-3">
                                <button
                                  onClick={() => {
                                    if (!showComments[run.id]) {
                                      fetchComments(run.id);
                                    }
                                    setShowComments(prev => ({ ...prev, [run.id]: !prev[run.id] }));
                                  }}
                                  className="text-sm text-[#66ff00] hover:text-[#66ff00]/80 font-medium"
                                >
                                  {showComments[run.id] ? 'Hide' : 'Show'} Comments ({run.commentCount || 0})
                                </button>
                              </div>
                              
                              {showComments[run.id] && (
                                <div className="space-y-3">
                                  {/* Comment Input */}
                                  <div className="flex space-x-2">
                                    <input
                                      type="text"
                                      value={newComment[run.id] || ''}
                                      onChange={(e) => setNewComment(prev => ({ ...prev, [run.id]: e.target.value }))}
                                      placeholder="Write a comment..."
                                      className="flex-1 text-sm border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#66ff00] focus:border-[#66ff00] bg-gray-800 text-white placeholder-gray-400"
                                    />
                                    <button
                                      onClick={() => handleCreateComment(run.id)}
                                      className="px-3 py-2 bg-[#66ff00] text-black text-sm font-medium rounded-md hover:bg-[#66ff00]/80"
                                    >
                                      Comment
                                    </button>
                                  </div>
                                  
                                  {/* Comments List */}
                                  {comments[run.id]?.length > 0 ? (
                                    <div className="space-y-2">
                                      {comments[run.id].map((comment) => (
                                        <div key={comment.id} className="flex items-start space-x-2 p-2 bg-gray-800 rounded border border-gray-700">
                                          <div className="w-6 h-6 bg-[#66ff00]/20 rounded-full flex items-center justify-center flex-shrink-0 border border-[#66ff00]/30">
                                            <span className="text-[#66ff00] text-xs font-medium">
                                              {comment.author?.name?.charAt(0) || comment.author?.email?.charAt(0) || 'U'}
                                            </span>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2">
                                              <span className="text-sm font-medium text-white">
                                                {comment.author?.name || comment.author?.email}
                                              </span>
                                              <span className="text-xs text-gray-400">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                              </span>
                                            </div>
                                            <p className="text-sm text-gray-300 mt-1">{comment.content}</p>
                                          </div>
                                          {comment.isOwner && (
                                            <button
                                              onClick={() => handleDeleteComment(comment.id, run.id)}
                                              className="text-red-400 hover:text-red-600 flex-shrink-0"
                                            >
                                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1 1v3M4 7h16" />
                                              </svg>
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-400 italic">No comments yet. Be the first to comment!</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            {/* Right Column - Quick Actions */}
            <div className="space-y-6">
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  {isOwner && (
                    <button
                      onClick={() => setShowScheduleRun(true)}
                      className="w-full px-4 py-2 bg-[#66ff00] text-black text-sm font-medium rounded-md hover:bg-[#52cc00]"
                    >
                      Schedule Run
                    </button>
                  )}
                  <button className="w-full px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700">
                    Log a Run
                  </button>
                  <button 
                    onClick={() => setShowChat(!showChat)}
                    className="w-full px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700"
                  >
                    {showChat ? 'Hide Chat' : 'Message Group'}
                  </button>
                  {(() => {
                    const upcomingRuns = groupRuns.filter(run => run.runDateTime && new Date(run.runDateTime) > new Date());
                    if (upcomingRuns.length > 0) {
                      return (
                        <div className="px-4 py-2 bg-[#66ff00]/20 border border-[#66ff00]/30 rounded-md">
                          <div className="text-sm font-medium text-[#66ff00]">
                            {upcomingRuns.length} Upcoming Run{upcomingRuns.length !== 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-[#66ff00]">
                            Next: {new Date(upcomingRuns[0].runDateTime).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                  {/* Attendance Summary */}
                  {(() => {
                    const upcomingRuns = groupRuns.filter(run => run.runDateTime && new Date(run.runDateTime) > new Date());
                    if (upcomingRuns.length > 0) {
                      const totalGoing = upcomingRuns.reduce((sum, run) => sum + (run.attendanceSummary?.going || 0), 0);
                      const totalMaybe = upcomingRuns.reduce((sum, run) => sum + (run.attendanceSummary?.maybe || 0), 0);
                      const totalNotGoing = upcomingRuns.reduce((sum, run) => sum + (run.attendanceSummary?.notGoing || 0), 0);
                      
                      return (
                        <div className="px-4 py-2 bg-green-900/20 border border-green-800 rounded-md">
                          <div className="text-sm font-medium text-green-400 mb-2">Attendance Summary</div>
                          <div className="space-y-1 text-xs text-green-400">
                            <div className="flex items-center justify-between">
                              <span>Going:</span>
                              <span className="font-medium">{totalGoing}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Maybe:</span>
                              <span className="font-medium">{totalMaybe}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Not Going:</span>
                              <span className="font-medium">{totalNotGoing}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  {isJoined && !isOwner && (
                    <button 
                      onClick={handleLeaveGroup}
                      className="w-full px-4 py-2 border border-red-600 text-sm font-medium rounded-md text-red-400 bg-red-900/20 hover:bg-red-900/30"
                    >
                      Leave Group
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Group Chat */}
          {showChat && (
            <div className="mt-8 bg-gray-900 rounded-lg border border-gray-800">
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Group Chat</h2>
                    <p className="text-sm text-gray-300 mt-1">Chat with your group members</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      signalRService.getConnectionState() === 'Connected' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-xs text-gray-400">
                      {signalRService.getConnectionState()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Messages Area */}
              <div className="h-96 overflow-y-auto p-6">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#66ff00] mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-400">Loading messages...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-white">No messages yet</h3>
                      <p className="mt-1 text-sm text-gray-400">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwnMessage = message.user.email === session?.user?.email;
                      return (
                        <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                            {!isOwnMessage && (
                              <div className="flex items-center space-x-2 mb-1">
                                <div className="w-6 h-6 bg-[#66ff00]/20 rounded-full flex items-center justify-center flex-shrink-0 border border-[#66ff00]/30">
                                  <span className="text-[#66ff00] text-xs font-medium">
                                    {message.user.name?.charAt(0) || message.user.email?.charAt(0) || 'U'}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-400">{message.user.name || message.user.email}</span>
                              </div>
                            )}
                            <div className={`rounded-lg px-4 py-2 ${
                              isOwnMessage 
                                ? 'bg-[#66ff00] text-black' 
                                : 'bg-gray-800 text-white border border-gray-700'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <div className={`flex items-center justify-between mt-1 ${
                                isOwnMessage ? 'text-black/70' : 'text-gray-400'
                              }`}>
                                <span className="text-xs">
                                  {formatMessageTime(message.createdAt)}
                                  {message.isEdited && ' (edited)'}
                                </span>
                                {(isOwnMessage || isOwner) && (
                                  <button
                                    onClick={() => handleDeleteMessage(message.id)}
                                    className="text-xs hover:opacity-75 ml-2 text-red-400 hover:text-red-300"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Message Input */}
              <div className="p-6 border-t border-gray-800">
                {/* Typing Indicator */}
                {typingUsers.size > 0 && (
                  <div className="mb-3 text-sm text-gray-400 italic">
                    {Array.from(typingUsers).map((email, index) => {
                      const user = messages.find(m => m.user.email === email)?.user;
                      const name = user?.name || email;
                      return (
                        <span key={email}>
                          {name} is typing...
                          {index < typingUsers.size - 1 ? ', ' : ''}
                        </span>
                      );
                    })}
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      // Handle typing indicator
                      if (!isTyping && e.target.value.trim()) {
                        setIsTyping(true);
                        signalRService.userTyping(groupId, session?.user?.email);
                      } else if (isTyping && !e.target.value.trim()) {
                        setIsTyping(false);
                        signalRService.userStoppedTyping(groupId, session?.user?.email);
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#66ff00] focus:border-[#66ff00] bg-gray-800 text-white placeholder-gray-400"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-[#66ff00] text-black text-sm font-medium rounded-md hover:bg-[#66ff00]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Run Modal */}
        {showEditRun && editingRun && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-gray-900 border-gray-800">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Edit Run</h3>
                  <button
                    onClick={() => {
                      setShowEditRun(false);
                      setEditingRun(null);
                      setEditRunTitle('');
                      setEditRunContent('');
                      setEditRunDateTime('');
                      setEditRunLocation('');
                      setEditRunPace('');
                      setEditRunDistance('');
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleEditRun} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="editRunTitle" className="block text-sm font-medium text-gray-300">Run Title *</Label>
                    <Input
                      id="editRunTitle"
                      type="text"
                      required
                      value={editRunTitle}
                      onChange={(e) => setEditRunTitle(e.target.value)}
                      placeholder="e.g., Morning 5K, Trail Run, etc."
                      className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="editRunContent" className="block text-sm font-medium text-gray-300">Run Description (Optional)</Label>
                    <Textarea
                      id="editRunContent"
                      rows={3}
                      value={editRunContent}
                      onChange={(e) => setEditRunContent(e.target.value)}
                      placeholder="Describe the run, route, or any special instructions..."
                      className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editRunDateTime" className="block text-sm font-medium text-gray-300">Run Date & Time *</Label>
                      <Input
                        id="editRunDateTime"
                        type="datetime-local"
                        required
                        value={editRunDateTime}
                        onChange={(e) => setEditRunDateTime(e.target.value)}
                        className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="editRunLocation" className="block text-sm font-medium text-gray-300">Run Location *</Label>
                      <Input
                        id="editRunLocation"
                        type="text"
                        required
                        value={editRunLocation}
                        onChange={(e) => setEditRunLocation(e.target.value)}
                        placeholder="e.g., Central Park, NYC"
                        className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editRunPace" className="block text-sm font-medium text-gray-300">Expected Pace (Optional)</Label>
                      <Input
                        id="editRunPace"
                        type="text"
                        value={editRunPace}
                        onChange={(e) => setEditRunPace(e.target.value)}
                        placeholder="e.g., 8:00/mile, Easy pace"
                        className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="editRunDistance" className="block text-sm font-medium text-gray-300">Run Distance (Optional)</Label>
                      <Input
                        id="editRunDistance"
                        type="text"
                        value={editRunDistance}
                        onChange={(e) => setEditRunDistance(e.target.value)}
                        placeholder="e.g., 5K, 10 miles, etc."
                        className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditRun(false);
                        setEditingRun(null);
                        setEditRunTitle('');
                        setEditRunContent('');
                        setEditRunDateTime('');
                        setEditRunLocation('');
                        setEditRunPace('');
                        setEditRunDistance('');
                      }}
                      className="px-4 py-2 border border-gray-700 bg-gray-800 text-gray-300 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#66ff00] text-black rounded-md text-sm font-medium hover:bg-[#52cc00] transition-colors"
                    >
                      Update Run
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Run Confirmation Modal */}
        {showDeleteDialog && runToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-gray-900 border-gray-800">
              <div className="mt-3 text-center">
                <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-white">Delete Run</h3>
                <p className="mt-1 text-sm text-gray-400">
                  This action cannot be undone. This will permanently delete the run
                  <span className="font-medium text-white"> "{runToDelete.title}"</span>.
                </p>
                
                <div className="mt-6 flex justify-center space-x-3">
                  <button
                    onClick={() => setShowDeleteDialog(false)}
                    className="px-4 py-2 border border-gray-700 bg-gray-800 text-gray-300 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteRun}
                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Delete Run
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
