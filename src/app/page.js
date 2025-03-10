
'use client';

import { useState, useEffect } from 'react';
import Grid from '../components/Grid';

export default function Home() {
  const [sneakers, setSneakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Sneaker Collection</h1>
        <Grid sneakers={sneakers} loading={loading} error={error} />
      </div>
    </main>
  );
}
