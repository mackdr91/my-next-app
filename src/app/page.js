
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Grid from '../components/Grid';
import Modal from '../components/Modal';

export default function Home() {
  const { data: session, status } = useSession();
  const [sneakers, setSneakers] = useState([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSneaker, setEditingSneaker] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedSneakers, setSelectedSneakers] = useState([]);

  // Update loading state based on session status
  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
    } else if (status === 'authenticated') {
      // Keep loading true if we need to fetch sneakers
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [status]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/auth/signin';
    }
  }, [status]);

  const fetchSneakers = useCallback(async () => {
    if (!session || status !== 'authenticated') return;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      setError(null);
      
      const res = await fetch('/api/sneakers', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      setSneakers(data.sneakers);
    } catch (error) {
      console.error('Error fetching sneakers:', error);
      setError(error.name === 'AbortError' ? 'Request timed out. Please try again.' : error.message);
      setSneakers([]);
    } finally {
      setLoading(false);
    }
    
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [session, status]);

  // Load sneakers when authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      const cleanup = fetchSneakers();
      return () => cleanup && cleanup();
    }
  }, [status, fetchSneakers]);


  const handleAdd = () => {
    setEditingSneaker(null);
    setIsModalOpen(true);
  };

  const handleEdit = (sneaker) => {
    setEditingSneaker(sneaker);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedSneakers.length === 0) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/sneakers', {
        method: 'DELETE',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedSneakers })
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete sneakers');
      }

      await fetchSneakers();
      setIsDeleteMode(false);
      setSelectedSneakers([]);
    } catch (error) {
      console.error('Error deleting sneakers:', error);
      setError(error.name === 'AbortError' ? 'Request timed out. Please try again.' : (error.message || 'Failed to delete sneakers. Please try again.'));
    } finally {
      setLoading(false);
      clearTimeout(timeoutId);
      controller.abort();
    }
  };

  const handleToggleSelect = (_id) => {
    setSelectedSneakers(prev =>
      prev.includes(_id)
        ? prev.filter(sneakerId => sneakerId !== _id)
        : [...prev, _id]
    );
  };



  return (
    <main className="min-h-screen bg-black bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px]">
      <div className="mx-auto py-8">
        <div className="max-w-[2000px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">Sneaker Collection</h1>
            {status === 'authenticated' && (
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="px-4 py-2 rounded-md text-white font-medium backdrop-blur-sm border border-white/20 hover:bg-white/10 transition-all duration-300"
              >
                Logout
              </button>
            )}

            <div className="flex gap-4">
              {isDeleteMode ? (
                <>
                  <button
                    onClick={handleDelete}
                    disabled={selectedSneakers.length === 0}
                    className={`px-4 py-2 rounded-md text-white font-medium backdrop-blur-sm border transition-all duration-300 ${selectedSneakers.length === 0 ? 'bg-red-500/30 border-red-500/20 cursor-not-allowed' : 'bg-red-500/20 border-red-500/30 hover:bg-red-500/30'}`}
                  >
                    Delete Selected ({selectedSneakers.length})
                  </button>
                  <button
                    onClick={() => {
                      setIsDeleteMode(false);
                      setSelectedSneakers([]);
                    }}
                    className="px-4 py-2 rounded-md text-white/80 font-medium backdrop-blur-sm bg-white/5 border border-white/20 hover:bg-white/10 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsDeleteMode(true)}
                    className="px-4 py-2 rounded-md text-white font-medium backdrop-blur-sm bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-all duration-300"
                  >
                    Delete Mode
                  </button>
                  <button
                    onClick={handleAdd}
                    className="px-4 py-2 rounded-md text-white font-medium backdrop-blur-sm bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all duration-300"
                  >
                    Add Sneaker
                  </button>
                </>
              )}
            </div>
          </div>
          {status === 'loading' || loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/30"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                {error}
                <button
                  onClick={fetchSneakers}
                  className="ml-4 text-sm underline hover:text-red-300"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <Grid
              sneakers={sneakers}
              loading={loading}
              error={error}
              onEdit={handleEdit}
              isDeleteMode={isDeleteMode}
              selectedSneakers={selectedSneakers}
              onToggleSelect={handleToggleSelect}
            />
          )}
        </div>
      </div>
      <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSneaker(null);
          }}
          onSubmit={async (sneakerData) => {
            setIsSubmitting(true);
            try {
              const method = editingSneaker ? 'PUT' : 'POST';
              const url = editingSneaker
                ? `/api/sneakers/${editingSneaker._id}`
                : '/api/sneakers';

              const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingSneaker ? { id: editingSneaker._id, ...sneakerData } : sneakerData),
              });

              if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to save sneaker');
              }

              fetchSneakers();
              setIsModalOpen(false);
              setEditingSneaker(null);
            } catch (error) {
              console.error('Error saving sneaker:', error);
              setError(error.message || 'Failed to save sneaker. Please try again.');
            } finally {
              setIsSubmitting(false);
            }
          }}
          editingSneaker={editingSneaker}
          isSubmitting={isSubmitting}
        />
    </main>
  );
}
