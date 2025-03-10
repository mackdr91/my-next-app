'use client';

import React from 'react';
import Card from './Card';

const LoadingSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200"></div>
    <div className="p-5 space-y-4">
      <div className="flex justify-between">
        <div className="h-6 w-24 bg-gray-200 rounded"></div>
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
      </div>
      <div className="flex justify-between">
        <div className="h-5 w-16 bg-gray-200 rounded"></div>
        <div className="h-5 w-16 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

const Grid = ({ sneakers, error, loading, onEdit, isDeleteMode, selectedSneakers, onToggleSelect }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 px-4 sm:px-6 md:px-8 max-w-[2000px] mx-auto">
        {[...Array(8)].map((_, index) => (
          <LoadingSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <p className="text-xl text-red-500">Error loading sneakers</p>
        <p className="mt-2">Please try again later</p>
      </div>
    );
  }

  if (!sneakers || sneakers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <p className="text-xl">No sneakers found</p>
        <p className="mt-2">Check back later for new arrivals</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 px-4 sm:px-6 md:px-8 max-w-[2000px] mx-auto">
      {sneakers.map((sneaker) => (
        <Card
          key={sneaker.id}
          sneaker={sneaker}
          onEdit={() => onEdit(sneaker)}
          isDeleteMode={isDeleteMode}
          isSelected={selectedSneakers.includes(sneaker.id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
};

export default Grid;
