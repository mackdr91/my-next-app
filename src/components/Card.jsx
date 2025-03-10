'use client';

import React from 'react';

const Card = ({ sneaker }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
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
