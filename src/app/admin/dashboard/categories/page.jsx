'use client'
import React, { useState, useEffect } from 'react';
import { Plus, X, Camera } from 'lucide-react';
import { toast } from 'react-toastify';
import FullScreenLoader from '@/app/components/FullScreenLoader/FullScreenLoader';
import { Trash2,Loader2 } from 'lucide-react';

const CategoryPage = () => {


    const [categories, setCategories] = useState([]);
    const [deletingId, setDeletingId] = useState(null);





    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            setDeletingId(id);
            const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete category');

            // Refresh categories after deletion
            setCategories(prev => prev.filter(cat => cat.CategoryID !== id));
        } catch (error) {
            alert(error.message);
        } finally {
            setDeletingId(null);
        }
    };



    async function fetchCategories() {
        try {
            const res = await fetch('/api/categories');
            if (!res.ok) throw new Error('Failed to fetch categories');
            const data = await res.json();
            console.log(data)
            setCategories(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {

        fetchCategories();
    }, []);






    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: null,
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle image file select & preview
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, image: file }));

            // Create preview URL
            const reader = new FileReader();
            reader.onload = (ev) => setImagePreview(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    // Close modal and reset form
    const closeModal = () => {
        if (loading) return; // Prevent closing while loading
        setIsModalOpen(false);
        setFormData({ name: '', description: '', image: null });
        setImagePreview(null);
    };

    // Submit handler: upload image, then send data to backend
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
                data.append('upload_preset', 'my_unsigned_preset'); // your unsigned preset
                data.append('folder', 'categories'); // optional folder

                const res = await fetch(
                    'https://api.cloudinary.com/v1_1/daw7edgbf/image/upload',
                    {
                        method: 'POST',
                        body: data,
                    }
                );

                if (!res.ok) throw new Error('Image upload failed');

                const fileData = await res.json();
                imageUrl = fileData.secure_url;
            }

            // Now send category info to backend
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

            toast.success('Category added successfully!');
            closeModal();
            fetchCategories()
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <FullScreenLoader />;



    return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 overflow-x-hidden">
      {/* Header and Add Button */}
      <div className="flex justify-between mb-6 sm:mb-8 flex-wrap gap-3 items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 uppercase">Categories</h1>
          <p className="text-sm text-gray-600 uppercase">Manage your product categories</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 sm:px-6 h-[40px] bg-gray-700 hover:bg-gray-800 text-white font-semibold rounded-lg shadow"
        >
          <Plus className="w-5 h-5 mr-2" />
          ADD CATEGORY
        </button>
      </div>

      {/* Categories Grid */}
      <div className="py-4 sm:py-6 px-2 sm:px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <div key={cat.CategoryID} className="bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div className="rounded-t-2xl overflow-hidden">
                <img
                  src={cat.DisplayImageURL || '/placeholder.png'}
                  alt={cat.CategoryName}
                  className="h-48 w-full object-cover"
                />
              </div>
              <div className="p-4 sm:p-6 flex flex-col justify-between h-[140px]">
                <div className="flex-1">
                  <h3
                    className="text-lg sm:text-xl font-bold text-gray-900 uppercase truncate mb-2"
                    title={cat.CategoryName}
                  >
                    {cat.CategoryName}
                  </h3>
                  <p
                    className="text-gray-600 text-sm leading-relaxed uppercase line-clamp-2"
                    title={cat.Description || 'No description'}
                  >
                    {cat.Description || 'No description available'}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-400 font-medium uppercase">Category</div>
                  <button
                    onClick={() => handleDelete(cat.CategoryID)}
                    disabled={loading === cat.CategoryID}
                    className="p-2 rounded-full bg-gray-100 text-gray-500"
                    title="Delete category"
                  >
                    {loading === cat.CategoryID ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-transparent bg-opacity-50 backdrop-blur-xl" onClick={closeModal}></div>

          <div className="relative bg-white rounded-sm shadow-2xl w-full max-w-md mx-4 p-6 z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Category</h2>
              <button onClick={closeModal} disabled={loading} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter category name"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Category Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Enter category description"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 cursor-pointer"
                  onClick={() => document.getElementById('image').click()}
                >
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img src={imagePreview} alt="Preview" className="mx-auto h-32 w-32 object-cover rounded-lg" />
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
                      <Camera className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="text-sm text-gray-600">
                        <span className="text-orange-600 font-medium">Click to upload</span> or drag and drop
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-yellow-500 hover:bg-orange-600 text-white rounded-md font-medium"
                >
                  {loading ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
