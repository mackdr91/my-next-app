'use client';

import React from 'react';

const Modal = ({ isOpen, onClose, onSubmit, isSubmitting, editingSneaker }) => {
  const [formErrors, setFormErrors] = React.useState({});
  const [formData, setFormData] = React.useState({
    brand: '',
    model: '',
    price: '',
    color: '',
    size: '',
    inStock: true
  });

  const validateField = (name, value) => {
    if (!value && name !== 'inStock') {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    // Trim strings for length validation
    if (typeof value === 'string') {
      value = value.trim();
    }

    switch (name) {
      case 'brand':
      case 'model':
        if (value.length < 2) {
          return `${name.charAt(0).toUpperCase() + name.slice(1)} must be at least 2 characters`;
        }
        if (value.length > 50) {
          return `${name.charAt(0).toUpperCase() + name.slice(1)} must be less than 50 characters`;
        }
        break;

      case 'color':
        if (value.length < 2) {
          return 'Color must be at least 2 characters';
        }
        if (value.length > 30) {
          return 'Color must be less than 30 characters';
        }
        if (!/^[a-zA-Z\s-]+$/.test(value)) {
          return 'Color must contain only letters, spaces, and hyphens';
        }
        break;

      case 'price':
        if (value && isNaN(value)) {
          return 'Price must be a valid number';
        }
        if (value && (value < 0 || value > 100000)) {
          return 'Price must be between $0 and $100,000';
        }
        break;
      case 'size':
        if (value && isNaN(value)) {
          return 'Size must be a valid number';
        }
        if (value && (value < 4 || value > 18)) {
          return 'Size must be between 4 and 18';
        }
        break;
      default:
        return '';
    }
    return '';
  };

  // Populate form when editing sneaker changes
  React.useEffect(() => {
    if (editingSneaker) {
      setFormData({
        brand: editingSneaker.brand,
        model: editingSneaker.model,
        price: editingSneaker.price.toString(),
        color: editingSneaker.color,
        size: editingSneaker.size.toString(),
        inStock: editingSneaker.inStock
      });
      setFormErrors({});
    } else {
      resetForm();
    }
  }, [editingSneaker]);

  const resetForm = () => {
    setFormData({
      brand: '',
      model: '',
      price: '',
      color: '',
      size: '',
      inStock: true
    });
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    // Clear error when field is modified
    setFormErrors(prev => ({ ...prev, [name]: '' }));
    
    // Validate field
    if (type !== 'checkbox') {
      const error = validateField(name, newValue);
      if (error) {
        setFormErrors(prev => ({ ...prev, [name]: error }));
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const errors = {};
    Object.entries(formData).forEach(([name, value]) => {
      if (name !== 'inStock') {
        const error = validateField(name, value);
        if (error) {
          errors[name] = error;
        }
      }
    });
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Convert price and size to numbers for final validation
    const numericPrice = Number(formData.price);
    const numericSize = Number(formData.size);

    if (isNaN(numericPrice) || isNaN(numericSize)) {
      setFormErrors(prev => ({
        ...prev,
        price: isNaN(numericPrice) ? 'Invalid price format' : '',
        size: isNaN(numericSize) ? 'Invalid size format' : ''
      }));
      return;
    }

    onSubmit({
      ...formData,
      price: Number(formData.price),
      size: Number(formData.size)
    });
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          {editingSneaker ? 'Edit Sneaker' : 'Add New Sneaker'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={isSubmitting}
            />
            {formErrors.brand && (
              <p className="mt-1 text-sm text-red-600">{formErrors.brand}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={isSubmitting}
            />
            {formErrors.model && (
              <p className="mt-1 text-sm text-red-600">{formErrors.model}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={isSubmitting}
            />
            {formErrors.price && (
              <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={isSubmitting}
            />
            {formErrors.color && (
              <p className="mt-1 text-sm text-red-600">{formErrors.color}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
            <input
              type="number"
              name="size"
              value={formData.size}
              onChange={handleChange}
              min="4"
              max="18"
              step="0.5"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={isSubmitting}
            />
            {formErrors.size && (
              <p className="mt-1 text-sm text-red-600">{formErrors.size}</p>
            )}
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="inStock"
              checked={formData.inStock}
              onChange={handleChange}
              className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label className="ml-2 block text-sm text-gray-700">In Stock</label>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#1a237e]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {editingSneaker ? 'Saving...' : 'Adding...'}
                </>
              ) : (
                editingSneaker ? 'Save Changes' : 'Add Sneaker'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
