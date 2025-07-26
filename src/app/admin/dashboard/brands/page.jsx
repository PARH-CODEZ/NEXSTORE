'use client';
import React, { useState, useEffect } from 'react';
import { Trash2, Loader2, Plus, X, Camera, BadgePercent, Eye, Edit3, Star } from 'lucide-react';
import FullScreenLoader from '@/app/components/FullScreenLoader/FullScreenLoader';
import BrandModal from '@/app/components/BrandModal/BrandModal';
import { toast } from 'react-toastify';

const BrandPage = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchBrands = async () => {
        try {
            const res = await fetch('/api/brand');
            if (!res.ok) throw new Error('Failed to fetch brands');
            const data = await res.json();
            setBrands(data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch brands');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this brand?')) return;
        try {
            setDeletingId(id);
            const res = await fetch(`/api/brand?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete brand');
            setBrands((prev) => prev.filter((b) => b.id !== id));
            toast.success('Brand deleted successfully!');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) return <FullScreenLoader />;

    return (
        <>
            <BrandModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onBrandAdded={() => {
                    fetchBrands();
                    setIsModalOpen(false);
                }}
            />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
                {/* Header Section */}
                <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-20">
                    <div className="px-4 sm:px-6 py-6">
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <BadgePercent className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                        BRANDS
                                    </h1>
                                    <p className="text-xs text-gray-500 font-medium mt-1 uppercase md:text-md">
                                        Manage your brand collection efficiently
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="group flex items-center gap-2 bg-gray-700 text-white font-semibold px-6 py-2 rounded-sm shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="hidden sm:inline">ADD BRAND</span>
                                <span className="sm:hidden">ADD</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="px-4 sm:px-6 py-6">




                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-10">
                        <StatCard
                            title="TOTAL BRANDS"
                            value={brands.length}
                            Icon={BadgePercent}
                            bgFrom="from-gray-200"
                            bgTo="to-gray-300"
                        />
                        <StatCard
                            title="WITH IMAGES"
                            value={brands.filter(brand => brand.imageUrl).length}
                            Icon={Eye}
                            bgFrom="from-green-100"
                            bgTo="to-green-200"
                        />
                        <StatCard
                            title="FEATURED"
                            value={brands.filter(brand => brand.featured).length || 0}
                            Icon={Star}
                            bgFrom="from-purple-100"
                            bgTo="to-purple-200"
                        />
                    </div>










                    {/* Brands Grid */}
                    {brands.length === 0 ? (
                        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-200/50 shadow-sm p-12 text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <BadgePercent className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 uppercase">No Brands Yet</h3>
                            <p className="text-gray-500 mb-6 uppercase">Get started by adding your first brand to the collection</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                CRETE ONE ?
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {brands.map((brand) => (
                                <div key={brand.id} className="group bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-6">
                                    <div className="flex flex-col items-center">
                                        {/* Brand Image */}
                                        <div className="relative mb-4">
                                            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-100 shadow-md group-hover:border-purple-200 transition-colors">
                                                <img
                                                    src={brand.imageUrl || '/placeholder.png'}
                                                    alt={brand.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                            {/* Status Indicator */}
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full border-2 border-white flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full" />
                                            </div>
                                        </div>

                                        {/* Brand Name */}
                                        <h3 className="text-md font-semibold text-gray-900 text-center line-clamp-1 mb-2 group-hover:text-purple-600 transition-colors uppercase">
                                            {brand.name}
                                        </h3>

                                        {/* Brand Stats */}
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                            <div className="flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                                <span>ACTIVE</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                                <span>ID: {brand.id}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 w-full">
                                            <button
                                                onClick={() => handleDelete(brand.id)}
                                                disabled={deletingId === brand.id}
                                                className="flex-1 p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                                title="DELETE BRAND"
                                            >
                                                {deletingId === brand.id ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span className="text-xs">Deleting...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Trash2 className="w-4 h-4" />
                                                        <span className="text-xs">DELETE</span>
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                                title="Edit brand"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default BrandPage;




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