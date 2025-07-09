'use client';
import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function BrandModal({ isOpen, onClose ,onBrandAdded }) {
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); 
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Preview before upload
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'my_unsigned_preset');
    formData.append('folder', 'brands');

    setUploading(true);

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/daw7edgbf/image/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.secure_url) {
        console.error('Cloudinary response:', data); 
        throw new Error('Upload failed');
      }



      setImageUrl(data.secure_url);
    } catch (err) {
      console.error('Cloudinary upload failed:', err);
      setError('IMAGE UPLOAD FAILED');
    } finally {
      
      setUploading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!name.trim() || !imageUrl) {
      setError('NAME AND IMAGE ARE REQUIRED');
      return;
    }

    try {
      const res = await fetch('/api/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), imageUrl }),
      });

      if (!res.ok) throw new Error('FAILED TO ADD BRAND');

      setSuccess(true);
      setName('');
      setImageFile(null);
      setImageUrl('');
      setImagePreview(null);
      onBrandAdded()
    } catch (err) {
      console.error(err);
      setError('ERROR ADDING BRAND');
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-40 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">ADD NEW BRAND</h2>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        {success && <p className="text-sm text-green-600 mb-3">BRAND ADDED SUCCESSFULLY!</p>}

        <form onSubmit={handleSubmit}>
          <label className="block text-xs font-semibold text-gray-600 mb-1">BRAND NAME</label>
          <input
            type="text"
            className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="E.G. APPLE"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="block text-xs font-semibold text-gray-600 mb-1">BRAND IMAGE</label>
          <div
            className="w-full h-40 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center mb-4 relative group cursor-pointer bg-gray-50 hover:border-blue-500 transition"
            onClick={() => document.getElementById('brand-image-input').click()}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-contain rounded-md"
              />
            ) : (
              <p className="text-gray-500 text-sm group-hover:text-blue-600">
                CLICK TO UPLOAD BRAND IMAGE
              </p>
            )}
            <input
              id="brand-image-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                setImageFile(file);
                handleImageUpload(file);
              }}
            />
          </div>

          {uploading && <p className="text-sm text-gray-500 mb-3">UPLOADING IMAGE...</p>}

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 disabled:opacity-50 text-sm font-semibold tracking-wide"
          >
            ADD BRAND
          </button>
        </form>
      </div>
    </div>
  );
}
