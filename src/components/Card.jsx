'use client';

import React from 'react';

const Card = ({ sneaker, onEdit, isDeleteMode, isSelected, onToggleSelect }) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-md overflow-hidden relative ${!isDeleteMode && 'hover:shadow-xl hover:scale-[1.02]'} ${isSelected && 'ring-2 ring-red-500'} transition-all duration-300`}
      onClick={() => isDeleteMode && onToggleSelect(sneaker.id)}
    >
      {isDeleteMode && (
        <div className="absolute top-2 right-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect(sneaker.id);
            }}
            className="h-5 w-5 text-red-500 rounded border-gray-300 focus:ring-red-500"
          />
        </div>
      )}
      {!isDeleteMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(sneaker);
          }}
          className="absolute top-2 right-2 z-10 p-2 text-gray-600 hover:text-blue-500 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </button>
      )}
      <div className="relative h-48 w-full bg-gradient-to-br from-blue-100 via-blue-50 to-gray-100">
        <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center">
          <span className="text-2xl font-bold text-gray-700">{sneaker.brand}</span>
          <span className="text-xl text-gray-600 mt-2">{sneaker.model}</span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900">${sneaker.price}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            sneaker.inStock 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {sneaker.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        <div className="flex justify-between items-center mt-4 text-sm font-medium">
          <div className="flex items-center">
            <span className="text-gray-600">Size:</span>
            <span className="ml-2 px-2 py-1 bg-gray-100 rounded-md text-gray-800">{sneaker.size}</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-600">Color:</span>
            <span className="ml-2 px-2 py-1 bg-gray-100 rounded-md text-gray-800">{sneaker.color}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
