"use client";
import { useSession } from "next-auth/react";
import ProtectedRoute from "../components/ProtectedRoute";
import Header from "../components/Header";
import { useState, useEffect } from "react";
import { getImageUrl } from "../utils/imageUtils";

export default function MyRuns() {
  const { data: session } = useSession();
  const [runs, setRuns] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showLogRun, setShowLogRun] = useState(false);
  const [showEditRun, setShowEditRun] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingRun, setEditingRun] = useState(null);
  const [deletingRun, setDeletingRun] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statsPeriod, setStatsPeriod] = useState("all");
  const [shoes, setShoes] = useState([]);

  // Form state for logging a new run
  const [newRun, setNewRun] = useState({
    title: "",
    notes: "",
    runDate: new Date().toISOString().split('T')[0],
    duration: "",
    distance: "",
    pace: "",
    location: "",
    routeName: "",
    weather: "",
    temperature: "",
    averageHeartRate: "",
    maxHeartRate: "",
    caloriesBurned: "",
    tags: "",
    feelingRating: "",
    isRace: false,
    raceName: "",
    raceResult: "",
    shoeId: ""
  });

  // Form data for editing a run
  const [editFormData, setEditFormData] = useState({
    title: "",
    notes: "",
    runDate: "",
    duration: "",
    distance: "",
    pace: "",
    location: "",
    routeName: "",
    weather: "",
    temperature: "",
    averageHeartRate: "",
    maxHeartRate: "",
    caloriesBurned: "",
    tags: "",
    feelingRating: "",
    isRace: false,
    raceName: "",
    raceResult: "",
    shoeId: ""
  });

  useEffect(() => {
    if (session?.user?.email) {
      fetchRuns();
      fetchStats();
      fetchShoes();
    }
  }, [session, currentPage, statsPeriod]);

  const fetchRuns = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const userEmail = session.user.email;
      
      const response = await fetch(
        `${apiUrl}/api/individualruns/user/${encodeURIComponent(userEmail)}?page=${currentPage}&pageSize=10`
      );
      
      if (response.ok) {
        const data = await response.json();
        setRuns(data.runs);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching runs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const userEmail = session.user.email;
      
      const response = await fetch(
        `${apiUrl}/api/individualruns/user/${encodeURIComponent(userEmail)}/stats?period=${statsPeriod}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchShoes = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const userEmail = session?.user?.email || '';
      
      if (!userEmail) {
        console.error('User session not loaded');
        return;
      }
      
      const response = await fetch(`${apiUrl}/api/shoe?userEmail=${encodeURIComponent(userEmail)}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched shoes:', data); // Debug logging
        
        // Ensure all shoes have required properties
        const validShoes = data.filter(shoe => 
          shoe && 
          shoe.id && 
          shoe.name && 
          typeof shoe.isActive === 'boolean'
        );
        
        console.log('Valid shoes:', validShoes); // Debug logging
        setShoes(validShoes);
      }
    } catch (error) {
      console.error('Error fetching shoes:', error);
    }
  };

  const handleEditRun = (run) => {
    setEditingRun(run);
    
    // Convert duration from seconds to HH:MM:SS format
    const formatDuration = (seconds) => {
      if (!seconds) return "";
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    setEditFormData({
      title: run.title || "",
      notes: run.notes || "",
      runDate: run.runDate ? new Date(run.runDate).toISOString().split('T')[0] : "",
      duration: formatDuration(run.duration),
      distance: run.distance?.toString() || "",
      pace: run.pace || "",
      location: run.location || "",
      routeName: run.routeName || "",
      weather: run.weather || "",
      temperature: run.temperature || "",
      averageHeartRate: run.averageHeartRate?.toString() || "",
      maxHeartRate: run.maxHeartRate?.toString() || "",
      caloriesBurned: run.caloriesBurned?.toString() || "",
      tags: run.tags || "",
      feelingRating: run.feelingRating?.toString() || "",
      isRace: run.isRace || false,
      raceName: run.raceName || "",
      raceResult: run.raceResult || "",
      shoeId: run.shoe?.id || ""
    });
    setShowEditRun(true);
  };

  const handleDeleteRun = (run) => {
    setDeletingRun(run);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteRun = async () => {
    if (!deletingRun) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const userEmail = session?.user?.email || '';
      
      if (!userEmail) {
        console.error('User session not loaded');
        return;
      }
      
      const response = await fetch(`${apiUrl}/api/individualruns/${deletingRun.id}?userEmail=${encodeURIComponent(userEmail)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setRuns(runs.filter(run => run.id !== deletingRun.id));
        setShowDeleteConfirm(false);
        setDeletingRun(null);
        fetchStats(); // Refresh stats
      } else {
        console.error("Failed to delete run");
      }
    } catch (error) {
      console.error("Error deleting run:", error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingRun) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      
      // Parse duration from HH:MM:SS format to total seconds
      let durationInSeconds = 0;
      if (editFormData.duration && editFormData.duration.includes(':')) {
        const durationParts = editFormData.duration.split(':').map(Number);
        durationInSeconds = (durationParts[0] || 0) * 3600 + (durationParts[1] || 0) * 60 + (durationParts[2] || 0);
      } else if (editFormData.duration) {
        // If it's already a number (seconds), use it directly
        durationInSeconds = parseInt(editFormData.duration) || 0;
      }
      
      const runData = {
        title: editFormData.title,
        notes: editFormData.notes || "",
        runDate: editFormData.runDate,
        duration: durationInSeconds,
        distance: parseFloat(editFormData.distance) || 0,
        pace: editFormData.pace || "",
        location: editFormData.location || "",
        routeName: editFormData.routeName || "",
        imageUrl: editFormData.imageUrl || "",
        weather: editFormData.weather || "",
        temperature: editFormData.temperature || "",
        averageHeartRate: editFormData.averageHeartRate ? parseInt(editFormData.averageHeartRate) : null,
        maxHeartRate: editFormData.maxHeartRate ? parseInt(editFormData.maxHeartRate) : null,
        caloriesBurned: editFormData.caloriesBurned ? parseFloat(editFormData.caloriesBurned) : null,
        routeData: editFormData.routeData || "",
        tags: editFormData.tags || "",
        feelingRating: editFormData.feelingRating ? parseInt(editFormData.feelingRating) : null,
        isRace: editFormData.isRace || false,
        raceName: editFormData.raceName || "",
        raceResult: editFormData.raceResult || "",
        shoeId: editFormData.shoeId || null
      };
      
      // Ensure shoeId is a valid GUID or null
      if (runData.shoeId && runData.shoeId !== "") {
        try {
          // Validate GUID format
          if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(runData.shoeId)) {
            console.warn('Invalid shoeId format, setting to null:', runData.shoeId);
            runData.shoeId = null;
          }
        } catch (error) {
          console.warn('Error validating shoeId, setting to null:', error);
          runData.shoeId = null;
        }
      } else {
        runData.shoeId = null;
      }

      const userEmail = session?.user?.email || '';
      
      if (!userEmail) {
        console.error('User session not loaded');
        return;
      }
      
      // Validate required fields
      if (!editFormData.title || !editFormData.runDate || !editFormData.distance) {
        console.error('Missing required fields:', { title: editFormData.title, runDate: editFormData.runDate, distance: editFormData.distance });
        return;
      }
      
      console.log('Sending update request with data:', runData);
      
      const response = await fetch(`${apiUrl}/api/individualruns/${editingRun.id}?userEmail=${encodeURIComponent(userEmail)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(runData),
      });

      if (response.ok) {
        // The backend returns NoContent() for updates, so we don't need to parse JSON
        // Just refresh the runs list to get the updated data
        console.log('Run updated successfully');
        fetchRuns(); // Refresh the runs list
        setShowEditRun(false);
        setEditingRun(null);
        fetchStats(); // Refresh stats
      } else {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (error) {
          errorText = 'Could not read error response';
        }
        console.error("Failed to update run:", response.status, errorText);
        console.error("Request data sent:", runData);
        console.error("Response headers:", Object.fromEntries(response.headers.entries()));
      }
    } catch (error) {
      console.error("Error updating run:", error);
    }
  };

  const handleLogRun = async (e) => {
    e.preventDefault();
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const userEmail = session.user.email;
      
      // Parse duration from HH:MM:SS format to total seconds
      const durationParts = newRun.duration.split(':').map(Number);
      const durationInSeconds = (durationParts[0] || 0) * 3600 + (durationParts[1] || 0) * 60 + (durationParts[2] || 0);
      
      const runData = {
        ...newRun,
        duration: durationInSeconds,
        distance: parseFloat(newRun.distance),
        averageHeartRate: newRun.averageHeartRate ? parseInt(newRun.averageHeartRate) : null,
        maxHeartRate: newRun.maxHeartRate ? parseInt(newRun.maxHeartRate) : null,
        caloriesBurned: newRun.caloriesBurned ? parseFloat(newRun.caloriesBurned) : null,
        feelingRating: newRun.feelingRating ? parseInt(newRun.feelingRating) : null,
        shoeId: newRun.shoeId || null
      };
      
      console.log('Creating run with data:', runData);
      console.log('Selected shoe ID:', newRun.shoeId);
      console.log('User email:', userEmail);
      
      const response = await fetch(`${apiUrl}/api/individualruns?userEmail=${encodeURIComponent(userEmail)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(runData),
      });
      
      if (response.ok) {
        const createdRun = await response.json();
        console.log('Run created successfully:', createdRun);
        setShowLogRun(false);
        setNewRun({
          title: "",
          notes: "",
          runDate: new Date().toISOString().split('T')[0],
          duration: "",
          distance: "",
          pace: "",
          location: "",
          routeName: "",
          weather: "",
          temperature: "",
          averageHeartRate: "",
          maxHeartRate: "",
          caloriesBurned: "",
          tags: "",
          feelingRating: "",
          isRace: false,
          raceName: "",
          raceResult: "",
          shoeId: ""
        });
        fetchRuns();
        fetchStats();
      }
    } catch (error) {
      console.error('Error logging run:', error);
    }
  };

  const formatDuration = (duration) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPace = (pace) => {
    if (!pace) return "N/A";
    return pace;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#1a1a1a] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-800 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-gray-800 rounded"></div>
                ))}
              </div>
              <div className="h-96 bg-gray-800 rounded"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Header />
      <div className="min-h-screen bg-[#1a1a1a] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#66ff00]">My Runs</h1>
            <p className="text-gray-300 mt-2">Track your running progress and log your achievements</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-center">
                <div className="p-2 bg-blue-900/20 rounded-lg">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Runs</p>
                  <p className="text-2xl font-semibold text-white">{stats.totalRuns || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-center">
                <div className="p-2 bg-[#66ff00]/20 rounded-lg">
                  <svg className="w-6 h-6 text-[#66ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 0 1111.314 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Distance</p>
                  <p className="text-2xl font-semibold text-white">{stats.totalDistance?.toFixed(1) || 0} mi</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-center">
                <div className="p-2 bg-purple-900/20 rounded-lg">
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Time</p>
                  <p className="text-2xl font-semibold text-white">
                    {stats.totalDuration ? Math.floor(stats.totalDuration / 3600) : 0}h {stats.totalDuration ? Math.floor((stats.totalDuration % 3600) / 60) : 0}m
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-900/20 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Avg Pace</p>
                  <p className="text-2xl font-semibold text-white">
                    {stats.averagePace ? `${Math.floor(stats.averagePace)}:${Math.round((stats.averagePace % 1) * 60).toString().padStart(2, '0')}/mi` : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Period Selector */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-300">Stats Period:</span>
              <select
                value={statsPeriod}
                onChange={(e) => setStatsPeriod(e.target.value)}
                className="border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setShowLogRun(true)}
              className="bg-[#66ff00] text-black px-6 py-2 rounded-lg hover:bg-[#52cc00] transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Log New Run
            </button>
          </div>

          {/* Runs List */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Recent Runs</h2>
            </div>
            
            {runs.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-white">No runs logged yet</h3>
                <p className="mt-1 text-sm text-gray-400">Get started by logging your first run!</p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowLogRun(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-black bg-[#66ff00] hover:bg-[#52cc00]"
                  >
                    Log Your First Run
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {runs.map((run) => (
                  <div key={run.id} className="px-6 py-4 hover:bg-gray-800 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-white">{run.title}</h3>
                          {run.isRace && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/20 text-yellow-300 border border-yellow-800">
                              Race
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 mt-1">{run.notes}</p>
                        <div className="mt-2 flex items-center space-x-6 text-sm text-gray-400">
                          <span>{formatDate(run.runDate)}</span>
                          <span>{run.distance} miles</span>
                          <span>{formatDuration(run.duration)}</span>
                          <span>{formatPace(run.pace)}</span>
                          {run.location && <span>{run.location}</span>}
                        </div>
                        {run.tags && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {run.tags.split(',').map((tag, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                        {run.shoe && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/20 text-blue-300 border border-blue-800">
                              👟 {run.shoe.name}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {run.imageUrl && (
                          <img
                            src={getImageUrl(run.imageUrl)}
                            alt="Run"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => handleEditRun(run)}
                            className="px-3 py-1 text-sm text-blue-400 border border-blue-800 rounded hover:bg-blue-900/20 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRun(run)}
                            className="px-3 py-1 text-sm text-red-400 border border-red-800 rounded hover:bg-red-900/20 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentPage === page
                        ? "text-black bg-[#66ff00] border border-[#66ff00]"
                        : "text-gray-400 bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>

        {/* Log Run Modal */}
        {showLogRun && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-gray-900 border-gray-800">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Log New Run</h3>
                  <button
                    onClick={() => setShowLogRun(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleLogRun} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Title *</label>
                      <input
                        type="text"
                        required
                        value={newRun.title}
                        onChange={(e) => setNewRun({...newRun, title: e.target.value})}
                        className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                        placeholder="Morning Run, Long Run, etc."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Date *</label>
                      <input
                        type="date"
                        required
                        value={newRun.runDate}
                        onChange={(e) => setNewRun({...newRun, runDate: e.target.value})}
                        className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Distance (miles) *</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={newRun.distance}
                        onChange={(e) => setNewRun({...newRun, distance: e.target.value})}
                        className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                        placeholder="5.0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Duration (HH:MM:SS) *</label>
                      <input
                        type="text"
                        required
                        value={newRun.duration}
                        onChange={(e) => setNewRun({...newRun, duration: e.target.value})}
                        className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                        placeholder="00:45:30"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Pace</label>
                      <input
                        type="text"
                        value={newRun.pace}
                        onChange={(e) => setNewRun({...newRun, pace: e.target.value})}
                        className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                        placeholder="8:30/mile"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Location</label>
                      <input
                        type="text"
                        value={newRun.location}
                        onChange={(e) => setNewRun({...newRun, location: e.target.value})}
                        className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                        placeholder="Central Park, NYC"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Weather</label>
                      <input
                        type="text"
                        value={newRun.weather}
                        onChange={(e) => setNewRun({...newRun, weather: e.target.value})}
                        className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                        placeholder="Sunny, Cloudy, Rainy"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Temperature</label>
                      <input
                        type="text"
                        value={newRun.temperature}
                        onChange={(e) => setNewRun({...newRun, temperature: e.target.value})}
                        className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                        placeholder="72°F"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Tags</label>
                      <input
                        type="text"
                        value={newRun.tags}
                        onChange={(e) => setNewRun({...newRun, tags: e.target.value})}
                        className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                        placeholder="long-run, tempo, trail"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Shoes</label>
                      <select
                        value={newRun.shoeId}
                        onChange={(e) => setNewRun({...newRun, shoeId: e.target.value})}
                        className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                      >
                        <option value="">Select shoes (optional)</option>
                        {shoes.filter(shoe => shoe && shoe.isActive && shoe.name).map((shoe) => (
                          <option key={shoe.id} value={shoe.id}>
                            {shoe.name} - {(shoe.totalMiles || 0).toFixed(1)} miles
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Notes</label>
                    <textarea
                      value={newRun.notes}
                      onChange={(e) => setNewRun({...newRun, notes: e.target.value})}
                      rows={3}
                      className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                      placeholder="How did the run feel? Any highlights or challenges?"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newRun.isRace}
                        onChange={(e) => setNewRun({...newRun, isRace: e.target.checked})}
                        className="h-4 w-4 text-[#66ff00] focus:ring-[#66ff00] border-gray-700 rounded bg-gray-800"
                      />
                      <span className="ml-2 text-sm text-gray-300">This was a race</span>
                    </label>
                  </div>
                  
                  {newRun.isRace && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Race Name</label>
                        <input
                          type="text"
                          value={newRun.raceName}
                          onChange={(e) => setNewRun({...newRun, raceName: e.target.value})}
                          className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                          placeholder="NYC Marathon"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Race Result</label>
                        <input
                          type="text"
                          value={newRun.raceResult}
                          onChange={(e) => setNewRun({...newRun, raceResult: e.target.value})}
                          className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                          placeholder="3:45:30"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowLogRun(false)}
                      className="px-4 py-2 border border-gray-700 bg-gray-800 text-gray-300 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#66ff00] text-black rounded-md text-sm font-medium hover:bg-[#52cc00] transition-colors"
                    >
                      Log Run
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Run Modal */}
        {showEditRun && editingRun && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-gray-900 border-gray-800">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Edit Run</h3>
                  <button
                    onClick={() => setShowEditRun(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Title *</label>
                      <input
                        type="text"
                        required
                        value={editFormData.title}
                        onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                        className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                        placeholder="Morning Run, Long Run, etc."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Date *</label>
                      <input
                        type="date"
                        required
                        value={editFormData.runDate}
                        onChange={(e) => setEditFormData({...editFormData, runDate: e.target.value})}
                        className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Distance (miles) *</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={editFormData.distance}
                        onChange={(e) => setEditFormData({...editFormData, distance: e.target.value})}
                        className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                        placeholder="5.0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Duration (HH:MM:SS) *</label>
                      <input
                        type="text"
                        required
                        value={editFormData.duration}
                        onChange={(e) => setEditFormData({...editFormData, duration: e.target.value})}
                        className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                        placeholder="00:45:30"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Pace</label>
                      <input
                        type="text"
                        value={editFormData.pace}
                        onChange={(e) => setEditFormData({...editFormData, pace: e.target.value})}
                        className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                        placeholder="8:30/mile"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Location</label>
                      <input
                        type="text"
                        value={editFormData.location}
                        onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                        className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                        placeholder="Central Park, NYC"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Weather</label>
                      <input
                        type="text"
                        value={editFormData.weather}
                        onChange={(e) => setEditFormData({...editFormData, weather: e.target.value})}
                        className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                        placeholder="Sunny, Cloudy, Rainy"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Temperature</label>
                      <input
                        type="text"
                        value={editFormData.temperature}
                        onChange={(e) => setEditFormData({...editFormData, temperature: e.target.value})}
                        className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                        placeholder="72°F"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Tags</label>
                      <input
                        type="text"
                        value={editFormData.tags}
                        onChange={(e) => setEditFormData({...editFormData, tags: e.target.value})}
                        className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                        placeholder="long-run, tempo, trail"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Shoes</label>
                      <select
                        value={editFormData.shoeId}
                        onChange={(e) => setEditFormData({...editFormData, shoeId: e.target.value})}
                        className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                      >
                        <option value="">Select shoes (optional)</option>
                        {shoes.filter(shoe => shoe && shoe.isActive && shoe.name).map((shoe) => (
                          <option key={shoe.id} value={shoe.id}>
                            {shoe.name} - {(shoe.totalMiles || 0).toFixed(1)} miles
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Notes</label>
                    <textarea
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                      rows={3}
                      className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                      placeholder="How did the run feel? Any highlights or challenges?"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editFormData.isRace}
                        onChange={(e) => setEditFormData({...editFormData, isRace: e.target.checked})}
                        className="h-4 w-4 text-[#66ff00] focus:ring-[#66ff00] border-gray-700 rounded bg-gray-800"
                      />
                      <span className="ml-2 text-sm text-gray-300">This was a race</span>
                    </label>
                  </div>
                  
                  {editFormData.isRace && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Race Name</label>
                        <input
                          type="text"
                          value={editFormData.raceName}
                          onChange={(e) => setEditFormData({...editFormData, raceName: e.target.value})}
                          className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                          placeholder="NYC Marathon"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Race Result</label>
                        <input
                          type="text"
                          value={editFormData.raceResult}
                          onChange={(e) => setEditFormData({...editFormData, raceResult: e.target.value})}
                          className="mt-1 block w-full border border-gray-700 bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                          placeholder="3:45:30"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditRun(false)}
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

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && deletingRun && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-gray-900 border-gray-800">
              <div className="mt-3 text-center">
                <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-white">Delete Run</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Are you sure you want to delete "{deletingRun.title}"? This action cannot be undone.
                </p>
                
                <div className="mt-6 flex justify-center space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
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
