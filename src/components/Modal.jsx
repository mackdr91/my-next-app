'use client';

import React from 'react';

const Modal = ({ isOpen, onClose, onSubmit, isSubmitting = false, editingSneaker = null }) => {
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

    switch (name) {
      case 'brand':
      case 'model':
      case 'color':
        if (value.length < 2) {
          return 'Required';
        }
        break;

      case 'price':
        if (value && isNaN(value)) {
          return 'Invalid price';
        }
        break;

      case 'size':
        if (value && isNaN(value)) {
          return 'Invalid size';
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
    
    setFormErrors(prev => ({ ...prev, [name]: '' }));
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

    const price = Number(formData.price);
    const size = Number(formData.size);

    if (isNaN(price)) errors.price = 'Invalid price';
    if (isNaN(size)) errors.size = 'Invalid size';

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    const trimmedData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        key,
        typeof value === 'string' ? value.trim() : value
      ])
    );

    // Check for empty required fields
    const emptyFields = Object.entries(trimmedData)
      .filter(([key, value]) => key !== 'inStock' && !value)
      .map(([key]) => key);

    if (emptyFields.length > 0) {
      setFormErrors(prev => ({
        ...prev,
        ...Object.fromEntries(emptyFields.map(field => [
          field,
          `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
        ]))
      }));
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Convert price and size to numbers for final validation
    const numericPrice = Number(trimmedData.price);
    const numericSize = Number(trimmedData.size);

    if (isNaN(numericPrice) || isNaN(numericSize)) {
      setFormErrors(prev => ({
        ...prev,
        price: isNaN(numericPrice) ? 'Invalid price format' : '',
        size: isNaN(numericSize) ? 'Invalid size format' : ''
      }));
      return;
    }

    // Submit the trimmed data
    onSubmit({
      ...trimmedData,
      price: numericPrice,
      size: numericSize
    });

    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 w-full max-w-md">

        <h2 className="text-2xl font-bold mb-6 text-white">
          {editingSneaker ? 'Edit Sneaker' : 'Add New Sneaker'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:bg-white/5 disabled:cursor-not-allowed"
              required
              disabled={isSubmitting}
            />
            {formErrors.brand && (
              <p className="mt-1 text-sm text-red-300">{formErrors.brand}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Model</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:bg-white/5 disabled:cursor-not-allowed"
              required
              disabled={isSubmitting}
            />
            {formErrors.model && (
              <p className="mt-1 text-sm text-red-300 flex items-center">
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {formErrors.model}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Price ($)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:bg-white/5 disabled:cursor-not-allowed"
              required
              disabled={isSubmitting}
            />
            {formErrors.price && (
              <p className="mt-1 text-sm text-red-300 flex items-center">
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {formErrors.price}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Color</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:bg-white/5 disabled:cursor-not-allowed"
              required
              disabled={isSubmitting}
            />
            {formErrors.color && (
              <p className="mt-1 text-sm text-red-300 flex items-center">
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {formErrors.color}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Size</label>
            <input
              type="number"
              name="size"
              value={formData.size}
              onChange={handleChange}
              min="4"
              max="18"
              step="0.5"
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:bg-white/5 disabled:cursor-not-allowed"
              required
              disabled={isSubmitting}
            />
            {formErrors.size && (
              <p className="mt-1 text-sm text-red-300 flex items-center">
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {formErrors.size}
              </p>
            )}
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="inStock"
              checked={formData.inStock}
              onChange={handleChange}
              className="h-4 w-4 bg-white/5 border-white/20 text-blue-400 focus:ring-blue-500/50 rounded"
              disabled={isSubmitting}
            />
            <label className="ml-2 block text-sm text-white/80">In Stock</label>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm bg-white/5 border border-white/20 hover:bg-white/10 rounded-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white backdrop-blur-sm bg-blue-500/20 border border-blue-500/30 rounded-md hover:bg-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
