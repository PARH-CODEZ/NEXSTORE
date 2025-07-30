'use client'
import React, { useState, useEffect } from 'react';
import { Plus, X, Camera, Trash2, Loader2, Package, Edit3, Eye, Tag, FileText, Sparkles, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';
import FullScreenLoader from '@/app/components/FullScreenLoader/FullScreenLoader';

const CategoryPage = () => {
    const [categories, setCategories] = useState([]);
    const [deletingId, setDeletingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: null,
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const gradientColors = [
        'from-violet-500 via-purple-500 to-pink-500',
        'from-blue-500 via-cyan-500 to-teal-500',
        'from-orange-500 via-red-500 to-pink-500',
        'from-green-500 via-emerald-500 to-teal-500',
        'from-indigo-500 via-blue-500 to-purple-500',
        'from-pink-500 via-rose-500 to-red-500',
        'from-yellow-500 via-orange-500 to-red-500',
        'from-teal-500 via-cyan-500 to-blue-500',
    ];

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            setDeletingId(id);
            const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete category');

            setCategories(prev => prev.filter(cat => cat.CategoryID !== id));
            toast.success('Category deleted successfully!');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setDeletingId(null);
        }
    };

    async function fetchCategories() {
        try {
            const res = await fetch('/api/categories');
            if (!res.ok) throw new Error('Failed to fetch categories');
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCategories();
    }, []);

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
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size must be less than 10MB');
                return;
            }

            setFormData((prev) => ({ ...prev, image: file }));

            const reader = new FileReader();
            reader.onload = (ev) => setImagePreview(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const closeModal = () => {
        if (submitting) return;
        setIsModalOpen(false);
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
            setSubmitting(true);
            let imageUrl = '';

            if (formData.image) {
                const data = new FormData();
                data.append('file', formData.image);
                data.append('upload_preset', 'my_unsigned_preset');
                data.append('folder', 'categories');

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
            fetchCategories();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <FullScreenLoader />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
            </div>

            {/* Header Section */}
            <div className="relative bg-white/60 backdrop-blur-xl border-b border-white/50 shadow-lg sticky top-0 z-20">
                <div className="px-6 py-8">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-sm flex items-center justify-center shadow-xl">
                                    <Package className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                    <Sparkles className="w-3 h-3 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-lg md:text-xl font-semibold bg-gradient-to-r bg-clip-text text-black uppercase ">
                                    Categories
                                </h1>
                                <p className="text-gray-600 font-normal mt-2 uppercase text-sm md:text-md">
                                    Organize and manage your product categories with style
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="group relative overflow-hidden bg-gray-800 text-white font-semibold px-4 py-2 rounded-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-center gap-3">
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                                <span className="hidden sm:inline text-sm">ADD CATEGORY</span>
                                <span className="sm:hidden text-sm">ADD NEW CATEGORY</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="relative px-6 py-8">

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-10">
                    <StatCard
                        title="TOTAL CATEGORIES"
                        value={categories.length}
                        Icon={Package}
                        bgFrom="from-gray-200"
                        bgTo="to-gray-300"
                    />
                    <StatCard
                        title="WITH IMAGES"
                        value={categories.filter(cat => cat.DisplayImageURL).length}
                        Icon={Eye}
                        bgFrom="from-green-100"
                        bgTo="to-green-200"
                    />
                    <StatCard
                        title="WITH DESCRIPTION"
                        value={categories.filter(cat => cat.Description).length}
                        Icon={FileText}
                        bgFrom="from-purple-100"
                        bgTo="to-purple-200"
                    />
                </div>



                {/* Categories Grid */}
                {categories.length === 0 ? (
                    <div className="relative bg-white/70 backdrop-blur-xl rounded-sm border border-white/50 shadow-xl p-16 text-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/5 to-purple-400/5 rounded-sm"></div>
                        <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-sm flex items-center justify-center mx-auto mb-6 shadow-xl">
                                <Package className="w-12 h-12 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Categories Yet</h3>
                            <p className="text-gray-600 mb-8 text-lg">Start building your product catalog by creating your first category</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                            >
                                Create First Category
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {categories.map((cat, index) => (
                            <div key={cat.CategoryID} className="group relative">
                                {/* Main Card */}
                                <div className="relative bg-white/80 backdrop-blur-xl rounded-sm border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:scale-105 hover:-translate-y-2">
                                    {/* Gradient Background */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors[index % gradientColors.length]} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                                    {/* Card Content */}
                                    <div className="relative p-8">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 bg-gradient-to-br ${gradientColors[index % gradientColors.length]} rounded-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                    <Tag className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Category</div>
                                                    <div className="text-xs text-gray-400 font-medium">#{cat.CategoryID}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(cat.CategoryID)}
                                                disabled={deletingId === cat.CategoryID}
                                                className="p-3 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 disabled:opacity-50 shadow-lg"
                                                title="Delete category"
                                            >
                                                {deletingId === cat.CategoryID ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Category Name */}
                                        <h3 className="text-md font-semibold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors duration-300 leading-tight uppercase">
                                            {cat.CategoryName}
                                        </h3>

                                        {/* Description */}
                                        <div className="mb-6">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-gray-600" />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700 uppercase">Description</span>
                                            </div>
                                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 pl-13">
                                                {cat.Description || 'No description provided for this category'}
                                            </p>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg">
                                                    <div className="w-full h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-pulse"></div>
                                                </div>
                                                <span className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Active</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {cat.DisplayImageURL && (
                                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                                                        <Eye className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                )}
                                                <div className="text-xs text-gray-400 font-medium">
                                                    {new Date().toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shine Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>


            {/* Enhanced Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />

                    <div className="relative bg-white/95 backdrop-blur-xl rounded-sm shadow-2xl border border-white/50 w-full max-w-lg">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-8 border-b border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-sm flex items-center justify-center shadow-lg">
                                    <Plus className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 uppercase">Add New Category</h2>
                            </div>
                            <button
                                onClick={closeModal}
                                disabled={submitting}
                                className="p-3 hover:bg-gray-100 rounded-2xl transition-colors disabled:opacity-50"
                            >
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3 uppercase">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-6 py-2 border border-gray-200 rounded-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-gray-50/50 focus:bg-white text-lg"
                                    placeholder="Enter category name"
                                    required
                                    disabled={submitting}
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-3 uppercase">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-6 border border-gray-200 rounded-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-gray-50/50 focus:bg-white resize-none text-lg"
                                    placeholder="Enter category description"
                                    disabled={submitting}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase">
                                    Category Image
                                </label>
                                <div
                                    className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer transition-all"
                                    onClick={() => document.getElementById('image').click()}
                                >
                                    {imagePreview ? (
                                        <div className="space-y-4">
                                            <div className="relative inline-block">
                                                <img src={imagePreview} alt="Preview" className="h-40 w-40 object-cover rounded-2xl shadow-lg" />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setImagePreview(null);
                                                        setFormData((prev) => ({ ...prev, image: null }));
                                                    }}
                                                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                                    disabled={submitting}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="text-sm text-gray-600 font-medium">
                                                Click to change image
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-sm flex items-center justify-center mx-auto shadow-lg">
                                                <Camera className="w-8 h-8 text-white" />
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                <span className="text-indigo-600 font-semibold uppercase">Click to upload</span> OR DRAG OR DROP
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
                                        disabled={submitting}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={submitting}
                                    className="flex-1 px-6  border border-gray-200 text-gray-700 rounded-sm hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50 text-sm uppercase"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-sm font-bold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl text-sm uppercase"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5" />
                                            Add Category
                                        </>
                                    )}
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


function StatCard({ title, value, Icon, bgFrom, bgTo }) {
    return (
        <div
            className={`bg-gradient-to-br ${bgFrom} ${bgTo} text-white p-4 sm:p-6 rounded-sm shadow-md transition hover:scale-[1.02] hover:shadow-lg`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs sm:text-sm font-semibold text-black">{title}</p>
                    <p className="text-xl sm:text-2xl font-semibold  text-black">{value}</p>
                </div>
                <Icon className="w-6 h-6 sm:w-8 sm:h-8  " />
            </div>
        </div>
    );
}
