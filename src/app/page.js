
'use client';

import { useState, useEffect } from 'react';
import Grid from '../components/Grid';
import Modal from '../components/Modal';

export default function Home() {
  const [sneakers, setSneakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSneaker, setEditingSneaker] = useState(null);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedSneakers, setSelectedSneakers] = useState([]);

  useEffect(() => {
    fetchSneakers();
  }, []);

  const fetchSneakers = () => {
    fetch('/api/sneakers')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        setSneakers(data.sneakers);
        setError(null);
      })
      .catch(error => {
        console.error('Error fetching sneakers:', error);
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

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

    try {
      const deletePromises = selectedSneakers.map(id =>
        fetch(`/api/sneakers/${id}`, { method: 'DELETE' })
          .then(res => {
            if (!res.ok) throw new Error(`Failed to delete sneaker ${id}`);
            return res.json();
          })
      );

      await Promise.all(deletePromises);
      fetchSneakers();
      setIsDeleteMode(false);
      setSelectedSneakers([]);
    } catch (error) {
      console.error('Error deleting sneakers:', error);
      setError('Failed to delete sneakers. Please try again.');
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedSneakers(prev =>
      prev.includes(id)
        ? prev.filter(sneakerId => sneakerId !== id)
        : [...prev, id]
    );
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto py-8">
        <div className="max-w-[2000px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Sneaker Collection</h1>
            <div className="flex gap-4">
              {isDeleteMode ? (
                <>
                  <button
                    onClick={handleDelete}
                    disabled={selectedSneakers.length === 0}
                    className={`px-4 py-2 rounded-md text-white font-medium ${selectedSneakers.length === 0 ? 'bg-red-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
                  >
                    Delete Selected ({selectedSneakers.length})
                  </button>
                  <button
                    onClick={() => {
                      setIsDeleteMode(false);
                      setSelectedSneakers([]);
                    }}
                    className="px-4 py-2 rounded-md text-gray-700 font-medium hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsDeleteMode(true)}
                    className="px-4 py-2 rounded-md text-white font-medium bg-red-500 hover:bg-red-600"
                  >
                    Delete Mode
                  </button>
                  <button
                    onClick={handleAdd}
                    className="px-4 py-2 rounded-md text-white font-medium bg-blue-500 hover:bg-blue-600"
                  >
                    Add Sneaker
                  </button>
                </>
              )}
            </div>
          </div>
          <Grid
            sneakers={sneakers}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            isDeleteMode={isDeleteMode}
            selectedSneakers={selectedSneakers}
            onToggleSelect={handleToggleSelect}
          />
        </div>
      </div>
      {isModalOpen && (
        <Modal
          onClose={() => {
            setIsModalOpen(false);
            setEditingSneaker(null);
          }}
          onSave={async (sneakerData) => {
            try {
              const method = editingSneaker ? 'PUT' : 'POST';
              const url = editingSneaker
                ? `/api/sneakers/${editingSneaker.id}`
                : '/api/sneakers';

              const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sneakerData),
              });

              if (!res.ok) throw new Error('Failed to save sneaker');

              fetchSneakers();
              setIsModalOpen(false);
              setEditingSneaker(null);
            } catch (error) {
              console.error('Error saving sneaker:', error);
              setError('Failed to save sneaker. Please try again.');
            }
          }}
          editingSneaker={editingSneaker}
        />
      )}
    </main>
  );
}
