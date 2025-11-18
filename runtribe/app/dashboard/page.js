"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";
import Header from "../components/Header";
import { useState, useEffect } from "react";
import { getImageUrl } from "../utils/imageUtils";

export default function Dashboard() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState([]);
  const [upcomingRuns, setUpcomingRuns] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRuns: 0,
    groupsJoined: 0,
    totalDistance: 0
  });

  // Fetch dashboard data
  useEffect(() => {
    if (session?.user?.email) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const userEmail = session.user.email;

      // Fetch groups
      const groupsResponse = await fetch(`${apiUrl}/api/groups?userEmail=${encodeURIComponent(userEmail)}`);
      let groupsData = [];
      if (groupsResponse.ok) {
        groupsData = await groupsResponse.json();
        setGroups(groupsData);
        setStats(prev => ({ ...prev, groupsJoined: groupsData.filter(g => g.isJoined).length }));
      }

      // Fetch upcoming runs from all groups
      const upcomingRunsData = [];
      for (const group of groupsData) {
        if (group.isJoined || group.isOwner) {
          try {
            const runsResponse = await fetch(`${apiUrl}/api/groupruns/group/${group.id}?userEmail=${encodeURIComponent(userEmail)}`);
            if (runsResponse.ok) {
              const runs = await runsResponse.json();
              const futureRuns = runs.filter(run => run.runDateTime && new Date(run.runDateTime) > new Date());
              upcomingRunsData.push(...futureRuns.map(run => ({ ...run, groupName: group.name, groupId: group.id })));
            }
          } catch (err) {
            console.error(`Error fetching runs for group ${group.id}:`, err);
          }
        }
      }
      
      // Sort upcoming runs by date
      upcomingRunsData.sort((a, b) => new Date(a.runDateTime) - new Date(b.runDateTime));
      setUpcomingRuns(upcomingRunsData.slice(0, 5)); // Show top 5 upcoming runs

      // Generate recent activity
      generateRecentActivity(groupsData, upcomingRunsData);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivity = (groupsData, runsData) => {
    const activities = [];
    const now = new Date();

    // Add group activities
    if (groupsData) {
      groupsData.forEach(group => {
        if (group.isJoined || group.isOwner) {
          activities.push({
            type: group.isOwner ? 'created' : 'joined',
            title: `${group.isOwner ? 'Created' : 'Joined'} "${group.name}" group`,
            time: new Date(group.createdAt),
            icon: 'group',
            color: group.isOwner ? 'purple' : 'green'
          });
        }
      });
    }

    // Add upcoming run activities
    runsData.forEach(run => {
      if (run.runDateTime && new Date(run.runDateTime) > now) {
        activities.push({
          type: 'upcoming_run',
          title: `Upcoming run: ${run.title || run.content?.substring(0, 30) + '...'}`,
          time: new Date(run.runDateTime),
          icon: 'run',
          color: 'blue',
          groupName: run.groupName
        });
      }
    });

    // Sort by time (most recent first) and take top 5
    activities.sort((a, b) => b.time - a.time);
    setRecentActivity(activities.slice(0, 5));
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const getActivityIcon = (type, color) => {
    const colorClasses = {
      blue: 'text-blue-400',
      green: 'text-[#66ff00]',
      purple: 'text-purple-400',
      red: 'text-red-400'
    };

    const bgClasses = {
      blue: 'bg-blue-900/20',
      green: 'bg-[#66ff00]/20',
      purple: 'bg-purple-900/20',
      red: 'bg-red-900/20'
    };

    if (type === 'group') {
      return (
        <div className={`h-8 w-8 ${bgClasses[color]} rounded-full flex items-center justify-center`}>
          <svg className={`h-4 w-4 ${colorClasses[color]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
      );
    } else if (type === 'run') {
      return (
        <div className={`h-8 w-8 ${bgClasses[color]} rounded-full flex items-center justify-center`}>
          <svg className={`h-4 w-4 ${colorClasses[color]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#66ff00] mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#1a1a1a]">
        {/* Navigation */}
        <Header />

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#66ff00]">Dashboard</h2>
            <p className="mt-2 text-gray-300">
              Welcome back! Here's what's happening with your running community.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-900/20 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Upcoming Runs</p>
                  <p className="text-2xl font-semibold text-white">{upcomingRuns.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-[#66ff00]/20 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-[#66ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Groups Joined</p>
                  <p className="text-2xl font-semibold text-white">{stats.groupsJoined}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-purple-900/20 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Groups Owned</p>
                  <p className="text-2xl font-semibold text-white">{groups.filter(g => g.isOwner).length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-800">
              <h3 className="text-lg font-medium text-white">Recent Activity</h3>
            </div>
            <div className="p-6">
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      {getActivityIcon(activity.icon, activity.color)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{activity.title}</p>
                        <p className="text-sm text-gray-400">{formatTimeAgo(activity.time)}</p>
                        {activity.groupName && (
                          <p className="text-xs text-gray-500">Group: {activity.groupName}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-white">No recent activity</h3>
                  <p className="mt-1 text-sm text-gray-400">Join some groups or schedule runs to see activity here!</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/groups"
                  className="block w-full text-left px-4 py-3 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:border-gray-600 transition-colors"
                >
                  Find running groups
                </Link>
                <Link
                  href="/profile"
                  className="block w-full text-left px-4 py-3 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:border-gray-600 transition-colors"
                >
                  Update profile
                </Link>
                {groups.filter(g => g.isOwner).length > 0 && (
                  <Link
                    href="/groups"
                    className="block w-full text-left px-4 py-3 border border-[#66ff00] rounded-md text-sm font-medium text-[#66ff00] hover:bg-[#66ff00]/10 transition-colors"
                  >
                    Manage your groups
                  </Link>
                )}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Upcoming Events</h3>
              {upcomingRuns.length > 0 ? (
                <div className="space-y-3">
                  {upcomingRuns.slice(0, 3).map((run, index) => (
                    <div key={index} className="border-l-4 border-[#66ff00] pl-4">
                      <p className="text-sm font-medium text-white">
                        {run.title || run.content?.substring(0, 30) + '...'}
                      </p>
                      <p className="text-sm text-gray-400">{formatDateTime(run.runDateTime)}</p>
                      <p className="text-xs text-gray-500">Group: {run.groupName}</p>
                      {run.runLocation && (
                        <p className="text-xs text-gray-500">📍 {run.runLocation}</p>
                      )}
                    </div>
                  ))}
                  {upcomingRuns.length > 3 && (
                    <Link 
                      href="/groups" 
                      className="block text-sm text-[#66ff00] hover:text-[#52cc00] mt-2 transition-colors"
                    >
                      View all upcoming runs →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <svg className="mx-auto h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-400">No upcoming events</p>
                  <p className="text-xs text-gray-500">Join groups to see scheduled runs</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 