'use client';
import React, { useState } from 'react';
import { X, Camera } from 'lucide-react';
import { toast } from 'react-toastify';
import FullScreenLoader from '@/app/components/FullScreenLoader/FullScreenLoader';

const CategoryModal = ({ isOpen, onClose ,onCategoryAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const closeAndReset = () => {
    if (loading) return;
    onClose();
    setFormData({ name: '', description: '', image: null });
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      setLoading(true);
      let imageUrl = '';

      if (formData.image) {
        const data = new FormData();
        data.append('file', formData.image);
        data.append('upload_preset', 'my_unsigned_preset');
        data.append('folder', 'categories');

        const res = await fetch('https://api.cloudinary.com/v1_1/daw7edgbf/image/upload', {
          method: 'POST',
          body: data,
        });

        if (!res.ok) throw new Error('Image upload failed');
        const fileData = await res.json();
        imageUrl = fileData.secure_url;
      }

      const backendRes = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          CategoryName: formData.name,
          Description: formData.description,
          DisplayImageURL: imageUrl,
        }),
      });

      if (!backendRes.ok) throw new Error('Failed to create category');
      onCategoryAdded()
      
      closeAndReset();
    } catch (error) {
     
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  if (loading) return <FullScreenLoader />;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-md" onClick={closeAndReset}></div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-md shadow-2xl w-full max-w-md mx-4 p-6 z-10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">ADD NEW CATEGORY</h2>
          <button onClick={closeAndReset} disabled={loading} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CATEGORY NAME</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Enter category name"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CATEGORY DESCRIPTION</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Optional description"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CATEGORY IMAGE</label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 cursor-pointer"
              onClick={() => document.getElementById('category-image').click()}
            >
              {imagePreview ? (
                <div className="space-y-4">
                  <img src={imagePreview} alt="Preview" className="mx-auto h-28 w-28 object-cover rounded-md" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePreview(null);
                      setFormData((prev) => ({ ...prev, image: null }));
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                    disabled={loading}
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Camera className="mx-auto h-10 w-10 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    <span className="text-blue-600 font-medium">Click to upload</span> or drag & drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF — Max 10MB</p>
                </div>
              )}
              <input
                type="file"
                id="category-image"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={closeAndReset}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-md font-medium"
            >
              ADD CATEGORY
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
