'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../components/ProtectedRoute';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getImageUrl } from '../utils/imageUtils';

export default function ShoesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [shoes, setShoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingShoe, setEditingShoe] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    startingMiles: '0',
    maxMiles: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (session) {
      fetchShoes();
    }
  }, [session]);

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

      console.log("response", response)
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched shoes with mileage:', data);
        setShoes(data);
      }
    } catch (error) {
      console.error('Error fetching shoes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const userEmail = session?.user?.email || '';
      
      if (!userEmail) {
        console.error('User session not loaded');
        return;
      }
      
      const url = editingShoe 
        ? `${apiUrl}/api/shoe/${editingShoe.id}?userEmail=${encodeURIComponent(userEmail)}`
        : `${apiUrl}/api/shoe?userEmail=${encodeURIComponent(userEmail)}`;
      
      const method = editingShoe ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startingMiles: parseFloat(formData.startingMiles) || 0,
          maxMiles: formData.maxMiles ? parseFloat(formData.maxMiles) : null
        })
      });

      if (response.ok) {
        setShowAddForm(false);
        setEditingShoe(null);
        resetForm();
        fetchShoes();
      } else {
        console.error('Failed to save shoe:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error saving shoe:', error);
    }
  };

  const handleEdit = (shoe) => {
    setEditingShoe(shoe);
    setFormData({
      name: shoe.name || '',
      brand: shoe.brand || '',
      startingMiles: shoe.startingMiles?.toString() || '0',
      maxMiles: shoe.maxMiles?.toString() || '',
      imageUrl: shoe.imageUrl || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (shoeId) => {
    if (!confirm('Are you sure you want to delete this shoe?')) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const userEmail = session?.user?.email || '';
      
      if (!userEmail) {
        console.error('User session not loaded');
        return;
      }
      
      const response = await fetch(`${apiUrl}/api/shoe/${shoeId}?userEmail=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        fetchShoes();
      }
    } catch (error) {
      console.error('Error deleting shoe:', error);
    }
  };

  const handleToggleActive = async (shoeId, isActive) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const userEmail = session?.user?.email || '';
      
      if (!userEmail) {
        console.error('User session not loaded');
        return;
      }
      
      const endpoint = isActive ? 'deactivate' : 'activate';
      const response = await fetch(`${apiUrl}/api/shoe/${shoeId}/${endpoint}?userEmail=${encodeURIComponent(userEmail)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        fetchShoes();
      }
    } catch (error) {
      console.error('Error updating shoe status:', error);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const response = await fetch(`${apiUrl}/api/imageupload/upload?type=shoes`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      } else {
        const errorData = await response.json();
        console.error('Failed to upload image:', errorData.message || 'Upload failed');
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      startingMiles: '0',
      maxMiles: '',
      imageUrl: ''
    });
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingShoe(null);
    resetForm();
  };

  const viewStats = (shoeId) => {
    router.push(`/shoes/${shoeId}`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
        <Header />
        
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#66ff00]">My Running Shoes</h2>
            <p className="mt-2 text-gray-300">
              Track your running shoes and monitor their mileage.
            </p>
          </div>

          {/* Add New Shoe Button */}
          <div className="flex justify-end mb-8">
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-[#66ff00] hover:bg-[#52cc00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#66ff00] transition-colors"
            >
              Add New Shoe
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#66ff00] mx-auto"></div>
                <p className="mt-4 text-gray-300">Loading shoes...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Add/Edit Form */}
              {showAddForm && (
                <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-md p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-white">
                    {editingShoe ? 'Edit Shoe' : 'Add New Shoe'}
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Shoe Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                          placeholder="e.g., Daily Trainers"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Brand
                        </label>
                        <input
                          type="text"
                          value={formData.brand}
                          onChange={(e) => setFormData({...formData, brand: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                          placeholder="e.g., Nike"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Starting Miles
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.startingMiles}
                          onChange={(e) => setFormData({...formData, startingMiles: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Max Miles
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.maxMiles}
                          onChange={(e) => setFormData({...formData, maxMiles: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                          placeholder="e.g., 500"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Shoe Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const imageUrl = await handleImageUpload(file);
                              if (imageUrl) {
                                setFormData({...formData, imageUrl});
                              }
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#66ff00] focus:border-transparent"
                        />
                        {formData.imageUrl && (
                          <div className="mt-2">
                            <img 
                              src={getImageUrl(formData.imageUrl)} 
                              alt="Shoe preview" 
                              className="w-20 h-20 object-cover rounded-md"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={cancelForm}
                        className="px-4 py-2 border border-gray-700 bg-gray-800 text-gray-300 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#66ff00] text-black rounded-md text-sm font-medium hover:bg-[#52cc00] transition-colors"
                      >
                        {editingShoe ? 'Update Shoe' : 'Add Shoe'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Shoes List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shoes.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-white">No shoes added yet</h3>
                    <p className="mt-1 text-sm text-gray-400">
                      Add your first pair of running shoes to start tracking!
                    </p>
                  </div>
                ) : (
                  shoes.map((shoe) => (
                    <div key={shoe.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 hover:shadow-lg transition-all">
                      {/* Shoe Image */}
                      {shoe.imageUrl && (
                        <div className="mb-4">
                          <img
                            src={getImageUrl(shoe.imageUrl)}
                            alt={shoe.name}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">{shoe.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          shoe.isActive 
                            ? 'bg-[#66ff00]/20 text-[#66ff00] border border-[#66ff00]/30' 
                            : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                        }`}>
                          {shoe.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {shoe.brand && (
                          <div className="flex items-center text-sm text-gray-400">
                            <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {shoe.brand}
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-400">
                          <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          {(shoe.totalMiles || 0).toFixed(1)} miles
                        </div>
                        
                        {shoe.maxMiles && (
                          <div className="flex items-center text-sm text-gray-400">
                            <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Max: {shoe.maxMiles} miles
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                 
                        
                        <button
                          onClick={() => handleEdit(shoe)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 hover:border-gray-500 transition-colors"
                        >
                          <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        
                        <button
                          onClick={() => handleToggleActive(shoe.id, shoe.isActive)}
                          className={`flex-1 inline-flex items-center justify-center px-3 py-2 border text-sm font-medium rounded-md transition-colors ${
                            shoe.isActive
                              ? 'border-yellow-700 text-yellow-300 bg-yellow-900/20 hover:bg-yellow-900/30 hover:border-yellow-600'
                              : 'border-green-700 text-green-300 bg-green-900/20 hover:bg-green-900/30 hover:border-green-600'
                          }`}
                        >
                          {shoe.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        
                        <button
                          onClick={() => handleDelete(shoe.id)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-red-700 text-sm font-medium rounded-md text-red-300 bg-red-900/20 hover:bg-red-900/30 hover:border-red-600 transition-colors"
                        >
                          <svg className="h-4 w-4 mr-1 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
