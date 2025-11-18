'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function ShoeStatsPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [shoeData, setShoeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (session && params.id) {
      fetchShoeStats();
    }
  }, [session, params.id]);

  const fetchShoeStats = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const userEmail = session?.user?.email || '';
      
      if (!userEmail) {
        setError('User session not loaded');
        return;
      }
      
      const response = await fetch(`${apiUrl}/api/shoe/${params.id}/stats?userEmail=${encodeURIComponent(userEmail)}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setShoeData(data);
      } else {
        setError('Failed to load shoe statistics');
      }
    } catch (error) {
      console.error('Error fetching shoe stats:', error);
      setError('Error loading shoe statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (minutes) => {
    if (minutes === 0) return 'N/A';
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}/mile`;
  };

  const getMileagePercentage = () => {
    if (!shoeData?.shoe?.maxMiles) return null;
    const percentage = (shoeData.totalMiles / shoeData.shoe.maxMiles) * 100;
    return Math.min(percentage, 100);
  };

  const getMileageColor = (percentage) => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">Loading...</div>
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !shoeData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-red-600">
              <p className="text-lg">{error || 'Shoe not found'}</p>
              <button
                onClick={() => router.push('/shoes')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Back to Shoes
              </button>
            </div>
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  const { shoe, totalRuns, totalMiles, totalDuration, averagePace, lastRun, monthlyStats } = shoeData;
  const mileagePercentage = getMileagePercentage();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        
        <div className="flex-1 container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/shoes')}
              className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
            >
              ← Back to Shoes
            </button>
            
            <div className="flex items-center gap-4">
              {shoe.imageUrl && (
                <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={shoe.imageUrl}
                    alt={shoe.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{shoe.name}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  {shoe.brand && <span>{shoe.brand}</span>}
                  {shoe.model && <span>{shoe.model}</span>}
                  {shoe.color && <span>{shoe.color}</span>}
                  {shoe.size && <span>Size {shoe.size}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Miles</h3>
              <p className="text-3xl font-bold text-blue-600">{totalMiles.toFixed(1)}</p>
              {mileagePercentage && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getMileageColor(mileagePercentage)}`}
                      style={{ width: `${mileagePercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {mileagePercentage.toFixed(1)}% of {shoe.maxMiles} mile limit
                  </p>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Runs</h3>
              <p className="text-3xl font-bold text-green-600">{totalRuns}</p>
              <p className="text-sm text-gray-500 mt-1">
                {totalRuns > 0 ? (totalMiles / totalRuns).toFixed(1) : 0} avg miles/run
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Time</h3>
              <p className="text-3xl font-bold text-purple-600">{formatDuration(totalDuration)}</p>
              <p className="text-sm text-gray-500 mt-1">
                {totalRuns > 0 ? formatDuration(totalDuration / totalRuns) : '0:00'} avg/run
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Average Pace</h3>
              <p className="text-3xl font-bold text-orange-600">{formatPace(averagePace)}</p>
              <p className="text-sm text-gray-500 mt-1">
                {totalRuns > 0 ? (totalMiles / (totalDuration / 3600)).toFixed(1) : 0} mph avg
              </p>
            </div>
          </div>

          {/* Shoe Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Shoe Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Purchase Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Purchase Date:</span> {new Date(shoe.purchaseDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Age:</span> {Math.floor((new Date() - new Date(shoe.purchaseDate)) / (1000 * 60 * 60 * 24))} days</p>
                  {shoe.maxMiles && (
                    <p><span className="font-medium">Recommended Max Miles:</span> {shoe.maxMiles}</p>
                  )}
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      shoe.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {shoe.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Additional Information</h3>
                <div className="space-y-2 text-sm">
                  {shoe.brand && <p><span className="font-medium">Brand:</span> {shoe.brand}</p>}
                  {shoe.model && <p><span className="font-medium">Model:</span> {shoe.model}</p>}
                  {shoe.color && <p><span className="font-medium">Color:</span> {shoe.color}</p>}
                  {shoe.size && <p><span className="font-medium">Size:</span> {shoe.size}</p>}
                  {shoe.notes && (
                    <div>
                      <span className="font-medium">Notes:</span>
                      <p className="text-gray-600 italic mt-1">"{shoe.notes}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Last Run */}
          {lastRun && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Last Run</h2>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{lastRun.title}</h3>
                    <p className="text-gray-600">{new Date(lastRun.runDate).toLocaleDateString()}</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><span className="font-medium">Distance:</span> {lastRun.distance} miles</p>
                      <p><span className="font-medium">Duration:</span> {formatDuration(lastRun.duration)}</p>
                      {lastRun.pace && <p><span className="font-medium">Pace:</span> {lastRun.pace}</p>}
                      {lastRun.location && <p><span className="font-medium">Location:</span> {lastRun.location}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/myruns`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    View All Runs
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Monthly Statistics */}
          {monthlyStats && monthlyStats.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Monthly Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Month</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Runs</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Total Miles</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Avg Pace</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyStats.map((month, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">
                          {month.monthName} {month.year}
                        </td>
                        <td className="py-3 px-4 text-gray-700">{month.totalRuns}</td>
                        <td className="py-3 px-4 text-gray-700">{month.totalMiles.toFixed(1)}</td>
                        <td className="py-3 px-4 text-gray-700">{formatPace(month.averagePace)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => router.push('/myruns')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Log a Run
            </button>
            
            <button
              onClick={() => router.push(`/shoes`)}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Back to Shoes
            </button>
          </div>
        </div>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
