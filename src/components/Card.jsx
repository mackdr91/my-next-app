'use client';

import React from 'react';

const Card = ({ sneaker, onEdit, isDeleteMode, isSelected, onToggleSelect }) => {
  return (
    <div 
      className={`bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden relative ${!isDeleteMode && 'hover:bg-white/20 hover:scale-[1.02]'} ${isSelected && 'ring-2 ring-red-500'} transition-all duration-300`}
      onClick={() => isDeleteMode && onToggleSelect(sneaker._id)}
    >
      {isDeleteMode && (
        <div className="absolute top-2 right-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect(sneaker._id);
            }}
            className="h-5 w-5 text-red-300 bg-white/5 rounded border-red-500/30 focus:ring-red-500/50 checked:bg-red-500/20"
          />
        </div>
      )}
      {!isDeleteMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(sneaker);
          }}
          className="absolute top-2 right-2 z-10 p-2 text-white hover:text-blue-300 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </button>
      )}
      <div className="relative h-48 w-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20">
        <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center">
          <span className="text-2xl font-bold text-white">{sneaker.brand}</span>
          <span className="text-xl text-white/80 mt-2">{sneaker.model}</span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">${sneaker.price}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm border ${
            sneaker.inStock 
              ? 'bg-green-500/10 text-green-300 border-green-500/20' 
              : 'bg-red-500/10 text-red-300 border-red-500/20'
          }`}>
            {sneaker.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        <div className="flex justify-between items-center mt-4 text-sm font-medium">
          <div className="flex items-center">
            <span className="text-white/80">Size:</span>
            <span className="ml-2 px-2 py-1 bg-white/10 rounded-md text-white">{sneaker.size}</span>
          </div>
          <div className="flex items-center">
            <span className="text-white/80">Color:</span>
            <span className="ml-2 px-2 py-1 bg-white/10 rounded-md text-white">{sneaker.color}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
